# hq

[`jq`](https://stedolan.github.io/jq/manual/)'s not as sophisticated cousin but for HTML.

## Installation

```
# with npm
npm install -g @cpclermont/hq

# with yarn
yarn global add @cpclermont/hq
```

## Usage

HTML isn't as well structured as JSON. But we can do some fun stuff with CSS selectors and attribute selectors.

`hq` commands all start with a CSS selector and are then optionally passed into a transformation:

```bash
# example settings
url="https://www.webpagetest.org"
cssSelector="head > script[src]:not([defer]):not([async])"

# examples
curl -s $url | hq "$cssSelector"
curl -s $url | hq "$cssSelector | html"
curl -s $url | hq "$cssSelector | text"
curl -s $url | hq "$cssSelector | innerHTML"
curl -s $url | hq "$cssSelector | attr(src)"
curl -s $url | hq "$cssSelector | attr(src, href)"
```

### Transformations

* `html` (alias: `outerHTML`) returns the `outerHTML` of the node.
* `text` returns the text in the node.
* `innerHTML` returns the innerHTML of the node :grimacing:.
* `attr(attrs)` returns the values of the attributes(comma separated).
  The output of unmatched attributes is skipped, every attribute is output to a new line.

  This exists so you can scrape URLs from different node types that
  might live in different attributes.

  e.g.

  ```bash
  curl -s https://www.webpagetest.org | hq '
    head > script[src]:not([defer]):not([async]),
    head > link[rel=stylesheet]
    | attr(src, href)'
  ```

  Where we want to list render blocking scripts and stylesheets in the
  order they are found.

## Examples

```
# Get URLs of scripts that are render blocking
curl -s https://www.webpagetest.org | hq '
  head > script[src]:not([defer]):not([async])
  | attr(src)'

# Get URLs of scripts and stylesheets that are render blocking
curl -s https://www.webpagetest.org | hq '
  head > script[src]:not([defer]):not([async]),
  head > link[rel=stylesheet]
  | attr(src, href)'
```

## Notes

This is scrappy and nowhere near as good as jq. But it's better than nothing :)

## License

MIT
