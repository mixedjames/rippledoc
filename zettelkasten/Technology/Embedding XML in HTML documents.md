# Embedding XML in HTML documents

## Why does this matter?

- We want to allow output documents to be transferred as single files
- Files should be playable on any computer without software requirements - _this essentially mandates a web-based solution_
- The files need to include:
  - The document itself
  - Any resources required by the document
  - The necessary code to display the document

## Ways to do it...

### script tags

```html
<script type="...">
...anything you want goes here (except </script>)
</script>
```

Where type must be anything other than a recognised script type. `application/xml` would be typical.

**Pros**

- Content is just treated as text
- We do our own parsing using DOMParser so we get an XML DOM

**Cons**

- Can't use `</script>` anywhere without escaping it - this includes in attributes!

### template tags

```html
<template> ...anything you want goes here </template>
```

Content is accessed as a document fragment via `element.content`. Content ends up parsed automatically by the browser's HTML parser so you will end up with an `HTMLDocument` not an XML one.

**Pros**

- Only thing that needs escaping is `</template>` tag - no need to escape attributes etc.

**Cons**

- Parsed by the HTML parser which (I think) means namespaces etc. might not work
