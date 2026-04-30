# DSL2React

Convert MasterGo designs to HTML/CSS with 85%+ fidelity.

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Using MasterGo URL
npm start https://mastergo.com/file/xxx/layer/yyy

# Using File ID and Layer ID
npm start -- --file xxx --layer yyy
```

## Configuration

Create a `.env` file:

```
MASTERGO_API_KEY=your_api_key_here
OUTPUT_DIR=./output
MIN_FIDELITY_SCORE=85
MAX_OPTIMIZATION_ITERATIONS=5
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build
npm run build
```

## Architecture

- **DSL Fetcher**: Fetch design data from MasterGo API
- **DSL Parser**: Parse DSL into structured tree
- **Rule Engine**: Convert DSL to HTML/CSS rules
- **HTML Generator**: Generate semantic HTML
- **Output Manager**: Write files and manage output

## Project Structure

```
src/
├── modules/
│   ├── fetcher/          # API client
│   ├── parser/           # DSL parsing
│   ├── rule-engine/      # CSS rules
│   ├── generator/        # HTML generation
│   └── output/           # File management
├── types/                # TypeScript types
└── cli.ts                # CLI interface
```

## License

ISC
