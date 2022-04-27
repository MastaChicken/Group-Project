/*
 * Represents the variants used for the alert
*/
export enum Variant {
  primary,
  success,
  netural,
  warning,
  danger,
}

/*
 * Represents the icons used for the alert
*/
export enum Icon {
  primary = "info-circle",
  success = "check2-circle",
  neutral = "gear",
  warning = "exclamation-triangle",
  danger = "exclamation-octagon",
}

/*
 * Creates an alert programmatically.
*/
export function createAlert(
  message: string,
  variant: Variant,
  icon: Icon,
  duration = 3000
) {
  const variantString = Variant[variant];
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant: variantString,
    closable: true,
    duration: duration,
    innerHTML: `
      <sl-icon name="${icon}" slot="icon"></sl-icon>
      ${message}
    `,
  });

  document.body.append(alert);
  return alert.toast();
}
