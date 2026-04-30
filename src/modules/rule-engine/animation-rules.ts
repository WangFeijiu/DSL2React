export class AnimationRuleEngine {
  generateTransition(properties: string[], duration: number = 300): string {
    return `transition: ${properties.join(', ')} ${duration}ms ease;`;
  }

  generateAnimation(name: string, duration: number, keyframes: string): string {
    return `
@keyframes ${name} {
${keyframes}
}

animation: ${name} ${duration}ms ease;`;
  }
}
