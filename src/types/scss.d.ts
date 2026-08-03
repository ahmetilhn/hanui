/**
 * SCSS modülü bildirimi.
 *
 * <p>Bundler `styles.button` erişimini gerçek sınıf adına çeviriyor ama
 * TypeScript dosyayı hiç görmüyor. `Record<string, string>` yerine
 * `{ readonly [key: string]: string }`: modül nesnesi salt okunur ve bir
 * bileşenin ona yazmaya çalışması derlemede yakalanmalı.
 */
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss';
declare module '*.css';
