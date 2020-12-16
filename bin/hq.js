#!/usr/bin/env node

const cheerio = require('cheerio');
const program = require('commander');
const fs = require('fs');

program
  .version('1.0.0')
  .description('HTML cousin of jq')
  .option('-d, --debug', 'output extra debugging')
  .arguments('<filter> [file]');

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', chunk => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', error => reject(error));
  });
}

const getStream = file => {
  if (file) return fs.createReadStream(file, 'utf8');
  process.stdin.setEncoding('utf8');
  return process.stdin;
};

function getValue($, el, token) {
  // e.g. `| html`, `| outerHTML`
  if (/^(outer)?html$/i.test(token || 'html')) return $.html(el);

  // e.g. `| text`
  if (token === 'text') return $(el).text();

  // e.g. `| innerHTML`
  if (/innerhtml/i.test(token)) return $(el).html();

  // e.g. `| attr(src)`
  // e.g. `| attr(src, href)`
  if (/^attr\(/.test(token)) {
    const [, attrs] = token.match(/^attr\(([^)]+)\)/);
    const $el = $(el);
    return attrs
      .split(',')
      .map(trim)
      .map(attr => $el.attr(attr))
      .filter(Boolean)
      .join('\n')
  }

  throw new Error(`${token} filter is not supported`);
}

const trim = x => x.trim();

async function run(filter, file) {
  const stream = getStream(file);
  const html = await readStream(stream);
  const $ = cheerio.load(html);
  const commands = filter.split(';');
  for (const pipeline of filter.split(';')) {
    const tokens = pipeline.split('|').map(trim);
    const selector = tokens[0];
    $(selector).each((i, el) => console.log(getValue($, el, tokens[1])));
  }
}

async function main() {
  program.parse(process.argv);
  let statusCode = 0;
  try {
    await run(...program.args);
  } catch (e) {
    console.log(e);
    statusCode = 1;
  }
  process.exit(statusCode);
}

main();
