package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
	"helm.sh/helm/v3/pkg/chart/loader"
	"helm.sh/helm/v3/pkg/chartutil"
	"helm.sh/helm/v3/pkg/engine"
)

type composeFile struct {
	Version  string                    `yaml:"version"`
	Services map[string]composeService `yaml:"services"`
	Volumes  map[string]any            `yaml:"volumes"`
}

type composeService struct {
	Build       composeBuild                 `yaml:"build"`
	EnvFile     []string                     `yaml:"env_file"`
	DependsOn   map[string]composeDependency `yaml:"depends_on"`
	Ports       []string                     `yaml:"ports"`
	Healthcheck map[string]any               `yaml:"healthcheck"`
}

type composeBuild struct {
	Context    string `yaml:"context"`
	Dockerfile string `yaml:"dockerfile"`
}

type composeDependency struct {
	Condition string `yaml:"condition"`
}

type resource struct {
	APIVersion string         `yaml:"apiVersion"`
	Kind       string         `yaml:"kind"`
	Metadata   resourceMeta   `yaml:"metadata"`
	Spec       map[string]any `yaml:"spec"`
}

type resourceMeta struct {
	Name string `yaml:"name"`
}

func main() {
	root, err := findWorkspaceRoot()
	if err != nil {
		fail(err)
	}

	if err := validateCompose(root); err != nil {
		fail(err)
	}

	k8sResources, err := loadManifestResources(filepath.Join(root, "deploy", "k8s"))
	if err != nil {
		fail(err)
	}
	if err := validateK8sSet("k8s", k8sResources, map[string]string{
		"api":        "template-api",
		"web":        "template-web",
		"worker":     "template-worker",
		"ingress":    "template-ingress",
		"secret":     "template-secrets",
		"serviceAccount": "go-astro-template",
	}); err != nil {
		fail(err)
	}
	fmt.Printf("[deploycheck] k8s validated resources=%d\n", len(k8sResources))

	chartDir := filepath.Join(root, "deploy", "helm", "go-astro-template")
	profiles := []struct {
		name       string
		valueFiles []string
	}{
		{name: "base", valueFiles: []string{filepath.Join(chartDir, "values.yaml")}},
		{name: "staging", valueFiles: []string{filepath.Join(chartDir, "values.yaml"), filepath.Join(chartDir, "values.staging.yaml")}},
		{name: "production", valueFiles: []string{filepath.Join(chartDir, "values.yaml"), filepath.Join(chartDir, "values.production.yaml")}},
	}

	for _, profile := range profiles {
		resources, err := renderHelmResources(chartDir, profile.valueFiles, "go-astro-template")
		if err != nil {
			fail(fmt.Errorf("helm/%s 渲染失败: %w", profile.name, err))
		}
		if err := validateK8sSet("helm/"+profile.name, resources, map[string]string{
			"api":            "go-astro-template-api",
			"web":            "go-astro-template-web",
			"worker":         "go-astro-template-worker",
			"ingress":        "go-astro-template",
			"secret":         "go-astro-template-secrets",
			"serviceAccount": "go-astro-template",
		}); err != nil {
			fail(err)
		}
		fmt.Printf("[deploycheck] helm/%s validated resources=%d\n", profile.name, len(resources))
	}

	fmt.Println("[deploycheck] all deployment artifacts validated")
}

func validateCompose(root string) error {
	path := filepath.Join(root, "deploy", "docker", "docker-compose.yml")
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	var file composeFile
	if err := yaml.Unmarshal(data, &file); err != nil {
		return err
	}

	requiredServices := []string{"postgres", "redis", "api", "web", "worker"}
	for _, serviceName := range requiredServices {
		service, ok := file.Services[serviceName]
		if !ok {
			return fmt.Errorf("compose 缺少服务 %s", serviceName)
		}
		for dependency := range service.DependsOn {
			if _, exists := file.Services[dependency]; !exists {
				return fmt.Errorf("compose 服务 %s 依赖未知服务 %s", serviceName, dependency)
			}
		}
	}

	for _, serviceName := range []string{"postgres", "redis", "api"} {
		if len(file.Services[serviceName].Healthcheck) == 0 {
			return fmt.Errorf("compose 服务 %s 缺少 healthcheck", serviceName)
		}
	}

	for _, serviceName := range []string{"api", "web"} {
		if len(file.Services[serviceName].Ports) == 0 {
			return fmt.Errorf("compose 服务 %s 缺少端口暴露", serviceName)
		}
	}

	for _, serviceName := range []string{"api", "web", "worker"} {
		service := file.Services[serviceName]
		contextDir := filepath.Clean(filepath.Join(filepath.Dir(path), service.Build.Context))
		dockerfile := filepath.Clean(filepath.Join(contextDir, service.Build.Dockerfile))
		if _, err := os.Stat(dockerfile); err != nil {
			return fmt.Errorf("compose 服务 %s Dockerfile 不存在: %s", serviceName, dockerfile)
		}
	}

	for _, serviceName := range []string{"api", "worker"} {
		for _, envFile := range file.Services[serviceName].EnvFile {
			envPath := filepath.Clean(filepath.Join(filepath.Dir(path), envFile))
			if _, err := os.Stat(envPath); err != nil {
				return fmt.Errorf("compose 服务 %s env_file 不存在: %s", serviceName, envPath)
			}
		}
	}

	if _, ok := file.Volumes["postgres-data"]; !ok {
		return errors.New("compose 缺少 postgres-data volume")
	}

	fmt.Printf("[deploycheck] compose validated services=%d\n", len(requiredServices))
	return nil
}

func renderHelmResources(chartDir string, valueFiles []string, releaseName string) ([]resource, error) {
	chart, err := loader.Load(chartDir)
	if err != nil {
		return nil, err
	}

	values := map[string]any{}
	for _, file := range valueFiles {
		part, err := readYAMLMap(file)
		if err != nil {
			return nil, err
		}
		values = mergeMaps(values, part)
	}

	renderValues, err := chartutil.ToRenderValues(chart, values, chartutil.ReleaseOptions{
		Name:      releaseName,
		Namespace: "default",
		IsInstall: true,
		Revision:  1,
	}, chartutil.DefaultCapabilities)
	if err != nil {
		return nil, err
	}

	rendered, err := engine.Render(chart, renderValues)
	if err != nil {
		return nil, err
	}

	resources := make([]resource, 0, len(rendered))
	names := make([]string, 0, len(rendered))
	for name := range rendered {
		names = append(names, name)
	}
	sort.Strings(names)

	for _, name := range names {
		body := strings.TrimSpace(rendered[name])
		if body == "" {
			continue
		}
		items, err := decodeResources([]byte(body))
		if err != nil {
			return nil, fmt.Errorf("%s: %w", name, err)
		}
		resources = append(resources, items...)
	}
	return resources, nil
}

func loadManifestResources(dir string) ([]resource, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	resources := make([]resource, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".yaml") {
			continue
		}
		items, err := readResourceFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			return nil, err
		}
		resources = append(resources, items...)
	}
	return resources, nil
}

func readResourceFile(path string) ([]resource, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return decodeResources(data)
}

func decodeResources(data []byte) ([]resource, error) {
	decoder := yaml.NewDecoder(bytes.NewReader(data))
	resources := make([]resource, 0, 8)

	for {
		var raw map[string]any
		err := decoder.Decode(&raw)
		if errors.Is(err, io.EOF) {
			return resources, nil
		}
		if err != nil {
			return nil, err
		}
		if len(raw) == 0 {
			continue
		}

		body, err := yaml.Marshal(raw)
		if err != nil {
			return nil, err
		}

		var item resource
		if err := yaml.Unmarshal(body, &item); err != nil {
			return nil, err
		}
		if item.Kind == "" || item.APIVersion == "" || item.Metadata.Name == "" {
			return nil, fmt.Errorf("资源缺少关键字段: %s", strings.TrimSpace(string(body)))
		}
		resources = append(resources, item)
	}
}

func validateK8sSet(label string, resources []resource, names map[string]string) error {
	index := make(map[string]resource, len(resources))
	deploymentLabels := make(map[string]map[string]string)

	for _, item := range resources {
		index[item.Kind+"/"+item.Metadata.Name] = item
		if item.Kind == "Deployment" {
			matchLabels := nestedStringMap(item.Spec, "selector", "matchLabels")
			templateLabels := nestedStringMap(item.Spec, "template", "metadata", "labels")
			if len(matchLabels) == 0 {
				return fmt.Errorf("%s Deployment/%s 缺少 selector.matchLabels", label, item.Metadata.Name)
			}
			if !containsLabels(templateLabels, matchLabels) {
				return fmt.Errorf("%s Deployment/%s selector 与 template labels 不匹配", label, item.Metadata.Name)
			}
			deploymentLabels[item.Metadata.Name] = templateLabels
		}
	}

	required := []string{
		"Deployment/" + names["api"],
		"Deployment/" + names["web"],
		"Deployment/" + names["worker"],
		"Service/" + names["api"],
		"Service/" + names["web"],
		"PodDisruptionBudget/" + names["api"],
		"PodDisruptionBudget/" + names["web"],
		"PodDisruptionBudget/" + names["worker"],
		"HorizontalPodAutoscaler/" + names["api"],
	}
	for _, key := range required {
		if _, ok := index[key]; !ok {
			return fmt.Errorf("%s 缺少资源 %s", label, key)
		}
	}

	if ingress, ok := index["Ingress/"+names["ingress"]]; ok {
		services := nestedIngressServiceNames(ingress.Spec)
		if len(services) == 0 {
			return fmt.Errorf("%s Ingress/%s 缺少 backend service", label, ingress.Metadata.Name)
		}
		if !containsString(services, names["web"]) {
			return fmt.Errorf("%s Ingress/%s 未路由到 %s", label, ingress.Metadata.Name, names["web"])
		}
		if label == "k8s" && !containsString(services, names["api"]) {
			return fmt.Errorf("%s Ingress/%s 未路由到 %s", label, ingress.Metadata.Name, names["api"])
		}
	}

	for _, serviceName := range []string{names["api"], names["web"]} {
		service := index["Service/"+serviceName]
		selector := nestedStringMap(service.Spec, "selector")
		if len(selector) == 0 {
			return fmt.Errorf("%s Service/%s 缺少 selector", label, serviceName)
		}
		matched := false
		for _, labels := range deploymentLabels {
			if containsLabels(labels, selector) {
				matched = true
				break
			}
		}
		if !matched {
			return fmt.Errorf("%s Service/%s selector 未命中 Deployment", label, serviceName)
		}
	}

	hpa := index["HorizontalPodAutoscaler/"+names["api"]]
	if nestedString(hpa.Spec, "scaleTargetRef", "name") != names["api"] {
		return fmt.Errorf("%s HPA/%s scaleTargetRef.name 异常", label, names["api"])
	}

	for _, pdbName := range []string{names["api"], names["web"], names["worker"]} {
		pdb := index["PodDisruptionBudget/"+pdbName]
		selector := nestedStringMap(pdb.Spec, "selector", "matchLabels")
		matched := false
		for _, labels := range deploymentLabels {
			if containsLabels(labels, selector) {
				matched = true
				break
			}
		}
		if !matched {
			return fmt.Errorf("%s PodDisruptionBudget/%s selector 未命中 Deployment", label, pdbName)
		}
	}

	if strings.HasPrefix(label, "helm/") {
		if _, ok := index["Secret/"+names["secret"]]; !ok {
			return fmt.Errorf("%s 缺少 Secret/%s", label, names["secret"])
		}
		if _, ok := index["ServiceAccount/"+names["serviceAccount"]]; !ok {
			return fmt.Errorf("%s 缺少 ServiceAccount/%s", label, names["serviceAccount"])
		}
	}

	if label == "k8s" {
		if _, ok := index["Secret/"+names["secret"]]; !ok {
			return fmt.Errorf("%s 缺少 Secret/%s", label, names["secret"])
		}
		if _, ok := index["ServiceAccount/"+names["serviceAccount"]]; !ok {
			return fmt.Errorf("%s 缺少 ServiceAccount/%s", label, names["serviceAccount"])
		}
	}

	return nil
}

func nestedStringMap(raw map[string]any, path ...string) map[string]string {
	current := raw
	for i, key := range path {
		value, ok := current[key]
		if !ok {
			return nil
		}
		if i == len(path)-1 {
			typed, ok := value.(map[string]any)
			if !ok {
				return nil
			}
			result := make(map[string]string, len(typed))
			for childKey, childValue := range typed {
				result[childKey] = fmt.Sprint(childValue)
			}
			return result
		}
		next, ok := value.(map[string]any)
		if !ok {
			return nil
		}
		current = next
	}
	return nil
}

func nestedString(raw map[string]any, path ...string) string {
	current := raw
	for i, key := range path {
		value, ok := current[key]
		if !ok {
			return ""
		}
		if i == len(path)-1 {
			return fmt.Sprint(value)
		}
		next, ok := value.(map[string]any)
		if !ok {
			return ""
		}
		current = next
	}
	return ""
}

func nestedIngressServiceNames(spec map[string]any) []string {
	rules, ok := spec["rules"].([]any)
	if !ok || len(rules) == 0 {
		return nil
	}
	services := make([]string, 0, 4)
	for _, rawRule := range rules {
		rule, _ := rawRule.(map[string]any)
		httpMap, _ := rule["http"].(map[string]any)
		paths, _ := httpMap["paths"].([]any)
		for _, rawPath := range paths {
			path, _ := rawPath.(map[string]any)
			backend, _ := path["backend"].(map[string]any)
			service, _ := backend["service"].(map[string]any)
			name, _ := service["name"].(string)
			if name != "" && !containsString(services, name) {
				services = append(services, name)
			}
		}
	}
	return services
}

func containsLabels(haystack, needle map[string]string) bool {
	if len(needle) == 0 {
		return false
	}
	for key, value := range needle {
		if haystack[key] != value {
			return false
		}
	}
	return true
}

func containsString(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}

func readYAMLMap(path string) (map[string]any, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var raw map[string]any
	if err := yaml.Unmarshal(data, &raw); err != nil {
		return nil, err
	}
	return raw, nil
}

func mergeMaps(base, overlay map[string]any) map[string]any {
	if base == nil {
		base = map[string]any{}
	}
	result := make(map[string]any, len(base))
	for key, value := range base {
		result[key] = value
	}
	for key, overlayValue := range overlay {
		if baseValue, ok := result[key]; ok {
			baseMap, baseOK := baseValue.(map[string]any)
			overlayMap, overlayOK := overlayValue.(map[string]any)
			if baseOK && overlayOK {
				result[key] = mergeMaps(baseMap, overlayMap)
				continue
			}
		}
		result[key] = overlayValue
	}
	return result
}

func findWorkspaceRoot() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "deploy")); err == nil {
			return dir, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", errors.New("未找到 deploy 目录")
		}
		dir = parent
	}
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, "[deploycheck] error:", err)
	os.Exit(1)
}
