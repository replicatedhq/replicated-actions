import sys
import yaml
from python_mermaid.diagram import (
    MermaidDiagram,
    Node,
    Link
)

def generate_mermaid(action_yaml_file):
    # Load YAML file
    with open(action_yaml_file, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)

    # Add action node
    nodes = []
    action = Node(data['name'])
    nodes.append(action)
    # Add input nodes
    inputs = []
    if 'inputs' in data:
        for input_name in data['inputs']:
            input = Node(input_name, input_name)
            nodes.append(input)
            inputs.append(Link(input, action))

    # Add output nodes
    outputs = []
    if 'outputs' in data:
        for output_name in data['outputs']:
            output = Node(output_name, output_name)
            nodes.append(output)
            outputs.append(Link(action, output))

    chart = MermaidDiagram(
        title=data['name'],
        nodes=nodes,
        links=inputs+outputs,
        orientation = 'left to right'
    )

    return chart

def generate_inputs(action_yaml_file):
    # Load YAML file
    with open(action_yaml_file, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)

    # Add input nodes
    inputs = "| Name | Default | Required | Description |\n"
    inputs += "| --- | --- | --- | --- |\n"

    if 'inputs' in data:
        for input_name in data['inputs']:
            defaultVal = data['inputs'][input_name]['default'] if 'default' in data['inputs'][input_name] else ""
            requiredVal = data['inputs'][input_name]['required'] if 'required' in data['inputs'][input_name] else True
            descriptionVal = data['inputs'][input_name]['description'] if 'description' in data['inputs'][input_name] else ""
            inputs += "| " + input_name + " | " + defaultVal + " | " + str(requiredVal) + " | " + descriptionVal.replace('\n','<br>') + " |\n"

    return inputs

def generate_outputs(action_yaml_file):
    # Load YAML file
    with open(action_yaml_file, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)

    # Add output nodes
    outputs = "| Name | Description |\n"
    outputs += "| --- | --- |\n"

    if 'outputs' in data:
        for output_name in data['outputs']:
            descriptionVal = data['outputs'][output_name]['description'] if 'description' in data['outputs'][output_name] else ""
            outputs += "| " + output_name + " | " + descriptionVal + " |\n"

    return outputs

if __name__ == "__main__":
    mermaid = generate_mermaid(sys.argv[1])
    inputsTable = generate_inputs(sys.argv[1])
    outputsTable = generate_outputs(sys.argv[1])
    print("## " + mermaid.title + "\n")
    print("```mermaid")
    print(mermaid)
    print("```")
    print("## Inputs")
    print(inputsTable)
    print("## Outputs")
    print(outputsTable)
