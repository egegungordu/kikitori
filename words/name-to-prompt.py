
def read_census_names(filename, num_names):
    names = []
    with open(filename, 'r') as f:
        for _ in range(num_names):
            line = f.readline()
            if not line:
                break
            name = line.split(',')[0]
            names.append(name.lower())
    return names

def create_prompt(names):
    prompt = "I will spell the following names: \n"

    for name in names:
        spelled_name = ", ".join(name)
        prompt += f"{name.capitalize()}: {spelled_name}.\n"

    prompt += "That's all."

    return prompt

def main():
    names = read_census_names('census-female-names.csv', 100)
    prompt = create_prompt(names)
    print(prompt)

if __name__ == "__main__":
    main()

