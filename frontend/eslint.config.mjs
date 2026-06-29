import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  { ignores: [".next/", "node_modules/"] },
  ...nextVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-img-element": "off",
      "react/display-name": "off",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/role-has-required-aria-props": "off"
    }
  }
];

export default eslintConfig;
