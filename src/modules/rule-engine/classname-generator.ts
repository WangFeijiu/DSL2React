export class ClassNameGenerator {
  private usedNames = new Set<string>();

  generate(type: string, name: string): string {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let className = `${type}-${sanitized}`;

    // Handle conflicts
    let counter = 1;
    while (this.usedNames.has(className)) {
      className = `${type}-${sanitized}-${counter}`;
      counter++;
    }

    this.usedNames.add(className);
    return className;
  }

  reset(): void {
    this.usedNames.clear();
  }
}
