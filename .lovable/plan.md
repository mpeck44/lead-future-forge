Add the Google tag (gtag.js) to the site for Analytics/tracking.

### Scope
- Insert the provided Google tag snippet into `index.html` inside the `<head>` element.
- Place it near the top of `<head>` (after the meta charset/viewport tags) so it loads early.
- Use the exact snippet provided:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TMWWHLV7S4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TMWWHLV7S4');
</script>
```

### Files changed
- `index.html` only.

### Verification
- Confirm the snippet appears in `index.html`.
- Optional: run a preview build check to ensure no HTML parsing errors.