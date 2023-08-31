#!/usr/bin/env python3
import glob
import json


def get_dotkeys(val, dotkey=""):
    keys = []
    if isinstance(val, dict):
        for k in val.keys():
            keys = keys + get_dotkeys(val[k], dotkey + ("." if dotkey else "") + k)
    if dotkey:
        keys.append(dotkey)
    return keys


def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            destination[key] = value

    return destination


langs = ["en", "de", "es"]
app_path = "../src/app/"
i18n_path = "../src/assets/i18n/"

# Code replacements (templates)
target_files = glob.glob(app_path + "**/*.html", recursive=True)
for target_file in target_files:
    print("Replacing in: " + target_file)
    with open(target_file, "r") as file:
        content = file.read()

    content = content.replace("| translate", "| transloco")

    with open(target_file, "w") as file:
        file.write(content)

# Code replacements (TypeScript)
target_files = glob.glob(app_path + "**/*.ts", recursive=True)
for target_file in target_files:
    print("Replacing in: " + target_file)
    with open(target_file, "r") as file:
        content = file.read()

    content = content.replace(
        "import { TranslateLoader } from '@ngx-translate/core';\n", ""
    )
    content = content.replace(": TranslateService", ": TranslocoService")

    with open(target_file, "w") as file:
        file.write(content)

# I18n key replacements
modules = {
    "core": "home",
    "creator": "creator",
    "participant": "participant",
    "presentation": "creator",
    "admin": "admin",
}

i18n_json = {}
i18n_keys = {}
for module in modules:
    i18n_file = i18n_path + modules[module] + "/en.json"
    with open(i18n_file, "r") as file:
        i18n_json[modules[module]] = json.load(file)
    i18n_keys[modules[module]] = get_dotkeys(i18n_json[modules[module]])
    print(i18n_keys[modules[module]])
    print()

i18n_keys["base"] = []
already_compared = ["base"]
for i18n in i18n_keys:
    if i18n == "base":
        continue
    already_compared.append(i18n)
    for key in i18n_keys[i18n]:
        if i18n == "home":
            print("{0} found in {1}. Moving to base translation.".format(key, i18n))
            i18n_keys["base"].append(key)
            continue
        found_in = []
        for compared_i18n in i18n_keys:
            if compared_i18n in already_compared:
                continue
            if key in i18n_keys[compared_i18n]:
                found_in.append(compared_i18n)
        if len(found_in) > 0:
            print(
                "{0} found in {1} and {2}. Moving to base translation.".format(
                    key, i18n, found_in
                )
            )
            i18n_keys["base"].append(key)
print()

for module in modules:
    print("Module: " + module)
    target_files = glob.glob(
        app_path + module + "/**/*.html", recursive=True
    ) + glob.glob(app_path + module + "/**/*.ts", recursive=True)
    print("Files:")
    for file in target_files:
        print(file)
    print()

    for target_file in target_files:
        print("Replacing in: " + target_file)
        with open(target_file, "r") as file:
            content = file.read()

        for key in i18n_keys[modules[module]]:
            if not "." in key:
                key = key + "."
            search_term1 = "'" + key + "'"
            search_term2 = '"' + key + '"'
            if key in i18n_keys["base"]:
                print(
                    "Moving translation {0} from {1} to base translation.".format(
                        key, modules[module]
                    )
                )
                replace_term1 = "'{0}'".format(key)
                replace_term2 = '"{0}"'.format(key)
            else:
                replace_term1 = "'{0}.{1}'".format(modules[module], key)
                replace_term2 = '"{0}.{1}"'.format(modules[module], key)
            content = content.replace(search_term1, replace_term1)
            content = content.replace(search_term2, replace_term2)

        with open(target_file, "w") as file:
            file.write(content)
    print()
    print()

# Create base translation files with placeholder values
for lang in langs:
    merged_json = {}
    for module in modules:
        i18n_file = i18n_path + modules[module] + "/" + lang + ".json"
        with open(i18n_file, "r") as file:
            module_json = json.load(file)
        deep_merge(module_json, merged_json)
        empty_sections = []
        for key in i18n_keys["base"]:
            key_components = str(key).split(".")
            if not key_components[0] in module_json:
                continue
            if len(key_components) > 1:
                if key_components[1] in module_json[key_components[0]]:
                    module_json[key_components[0]].pop(key_components[1])
        for key in module_json:
            if not module_json[key]:
                empty_sections.append(key)
        for key in empty_sections:
            module_json.pop(key)
        with open(i18n_file, "w", encoding="utf8") as file:
            json.dump(module_json, file, ensure_ascii=False)

    result_json = {}
    for key in i18n_keys["base"]:
        key_components = str(key).split(".")
        if not key_components[0] in result_json:
            result_json[key_components[0]] = {}
        if len(key_components) > 1:
            result_json[key_components[0]][key_components[1]] = merged_json[
                key_components[0]
            ][key_components[1]]

    with open(i18n_path + lang + ".json", "w", encoding="utf8") as file:
        json.dump(result_json, file, ensure_ascii=False)
