# Contributing to SVG Icon Browser

Thank you for your interest in contributing to SVG Icon Browser! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/svg-icon-browser.git
   cd svg-icon-browser
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

1. **Add some test icons** to `src/assets/icons/` (or use existing ones)
2. **Build the icon index**:
   ```bash
   node scripts/build-icons.mjs
   ```
3. **Start the development server**:
   ```bash
   pnpm dev
   ```

## 📝 How to Contribute

### 🐛 Reporting Bugs

- Use the [GitHub issue tracker](https://github.com/yourusername/svg-icon-browser/issues)
- Check if the bug has already been reported
- Include:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser/OS information
  - Screenshots if applicable

### 💡 Suggesting Features

- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain why it would be valuable to users

### 🔧 Code Contributions

#### Types of Contributions We Welcome

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test improvements

#### Before You Code

- Check existing issues to avoid duplicate work
- For large features, open an issue first to discuss
- Make sure tests pass: `pnpm test` (if applicable)

#### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any`
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic
- **File Organization**: Keep components focused and modular

#### Commit Message Format

Use conventional commits:

```
feat: add dark theme support
fix: resolve search performance issue
docs: update installation guide
style: improve button hover states
refactor: simplify icon loading logic
test: add unit tests for utils
```

#### Code Review Process

1. **Submit a Pull Request** with:

   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - List of changes made

2. **Review Process**:

   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Keep PR focused and small when possible

3. **Requirements for Merge**:
   - All checks must pass
   - Code review approval
   - No merge conflicts
   - Documentation updated if needed

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── IconBrowser.tsx  # Main component
│   ├── IconGrid.tsx     # Virtualized grid
│   ├── IconModal.tsx    # Detail modal
│   └── Sidebar.tsx      # Filter sidebar
├── lib/                 # Utilities and types
│   ├── types.ts         # TypeScript definitions
│   └── utils.ts         # Helper functions
└── assets/icons/        # SVG icon collections
```

## 🧪 Testing

- Run existing tests: `pnpm test` (when available)
- Test your changes across different browsers
- Test with large icon collections (1000+ icons)
- Verify responsive design on mobile devices

## 📚 Development Tips

### Adding New Icon Collections

1. Create folder in `src/assets/icons/your-collection/`
2. Organize with supported structure:
   - `style/category/icon.svg` or
   - `category/style/icon.svg`
3. Run `node scripts/build-icons.mjs`
4. Test with your collection

### Performance Considerations

- Use React.memo for expensive components
- Debounce user inputs (search, filters)
- Virtualize large lists
- Lazy load data when possible

### Common Issues

- **"Too many open files"**: Use p-limit for file operations
- **Large bundle size**: Implement code splitting
- **Memory leaks**: Clean up event listeners and timers

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Follow the code of conduct

## 📞 Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/svg-icon-browser/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/svg-icon-browser/issues)
- 📧 Email: [your-email@example.com]

## 🎉 Recognition

Contributors will be:

- Listed in the README
- Mentioned in release notes
- Invited to be maintainers (for significant contributions)

Thank you for contributing! 🙏
