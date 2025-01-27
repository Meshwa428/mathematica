const wait = 100;

const intro = '# intro';

const intro_doc = {
  description: 'You can type math.js expressions and see the result.',
  examples: [
    '2 + 2',
    'round(e, 3)',
    'log(100000, 10)',
    '10cm to inch',
    'sin(90 deg)',
    'det([-1, 2; 3, 1])',
    '1 kg * 1 m / s^2',
    'help("round")',
  ]
}

function showDoc(doc) {
  if (!doc) {
    help.style.display = 'none';
    return;
  }

  function hideEmpty(elem, value) {
    elem.style.display = value ? 'block' : 'none';
  }

  help_name.textContent = doc.name;
  help_description.textContent = doc.description;

  help_syntax_code.textContent = doc.syntax?.join("\n");
  hljs.highlightElement(help_syntax_code);
  hideEmpty(help_syntax, doc.syntax);

  help_examples_code.textContent = doc.examples?.join("\n");
  hljs.highlightElement(help_examples_code);
  hideEmpty(help_examples, doc.examples);

  help_seealso_text.textContent = doc.seealso?.join(", ");
  hideEmpty(help_seealso, doc.seealso);

  help.style.display = 'block';
}

// Function to display MathJS documentation
function displayMathJSDocs(functionName) {
  const docsContainer = document.getElementById('mathjs-docs');
  docsContainer.innerHTML = ''; // Clear previous documentation

  try {
      // Using mathjs.help() to get documentation. This requires mathjs to be loaded.
      const doc = math.help(functionName).toJSON();

      if (doc) {
          const name = document.createElement('h2');
          name.textContent = doc.name;
          docsContainer.appendChild(name);

          const description = document.createElement('p');
          description.textContent = doc.description;
          docsContainer.appendChild(description);

          if (doc.syntax) {
              const syntaxHeader = document.createElement('h3');
              syntaxHeader.textContent = 'Syntax';
              docsContainer.appendChild(syntaxHeader);

              const syntaxList = document.createElement('ul');
              doc.syntax.forEach(syntax => {
                  const syntaxItem = document.createElement('li');
                  syntaxItem.textContent = syntax;
                  syntaxList.appendChild(syntaxItem);
              });
              docsContainer.appendChild(syntaxList);
          }

          if (doc.examples) {
              const examplesHeader = document.createElement('h3');
              examplesHeader.textContent = 'Examples';
              docsContainer.appendChild(examplesHeader);

              const examplesList = document.createElement('ul');
              doc.examples.forEach(example => {
                  const exampleItem = document.createElement('li');
                  exampleItem.textContent = example;
                  examplesList.appendChild(exampleItem);
              });
              docsContainer.appendChild(examplesList);
          }

          if (doc.seealso) {
              const seeAlsoHeader = document.createElement('h3');
              seeAlsoHeader.textContent = 'See also';
              docsContainer.appendChild(seeAlsoHeader);

              const seeAlsoList = document.createElement('ul');
              doc.seealso.forEach(seeAlso => {
                  const seeAlsoItem = document.createElement('li');
                  seeAlsoItem.textContent = seeAlso;
                  seeAlsoList.appendChild(seeAlsoItem);
              });
              docsContainer.appendChild(seeAlsoList);
          }
      } else {
          const notFound = document.createElement('p');
          notFound.textContent = 'Documentation not found.';
          docsContainer.appendChild(notFound);
      }
  } catch (error) {
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error fetching documentation: ' + error;
      docsContainer.appendChild(errorMsg);
  }
}

// Function to extract function names from the current line in the editor
function extractFunctionName(code, cursorPos) {
  const lines = code.split('\n');
  let currentLineIndex = 0;
  let accumulatedLength = 0;

  for (let i = 0; i < lines.length; i++) {
      accumulatedLength += lines[i].length + 1; // +1 for the newline character
      if (cursorPos <= accumulatedLength) {
          currentLineIndex = i;
          break;
      }
  }

  const currentLine = lines[currentLineIndex];

  // Regular expression to find function calls
  const functionRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let match;
  let functionName = null;

  while ((match = functionRegex.exec(currentLine)) !== null) {
      functionName = match[1];
  }

  return functionName;
}


function doMath(input) {
  let output = [];
  let scope = {};
  let doc;

  for (const line of input.split('\n')) {
    let output_line = '';
    if (line) {
      if (line.startsWith('#')) {
        if (line == '# intro') doc = intro_doc;
        output_line = '#';
      } else {
        try {
          const r = math.evaluate(line, scope);
          if (r) {
            if (r.doc) doc = r.doc;
            else output_line = math.format(r, 14);
          }
        } catch(e) {
          output_line = e.toString();
        }
      }
    }
    output.push(output_line);
  }

  results.updateCode(output.join('\n'));
  showDoc(doc);
}

function dropHandler(ev) {
  ev.preventDefault();

  const file = ev.dataTransfer.items[0].getAsFile();
  file.text().then(e => editor.updateCode(e));
}

async function start(url) {
  let code = intro;
  if (url) code = await (await fetch(url)).text();
  editor.updateCode(code);
  doMath(editor.toString());
}

// ... (other functions remain the same)

var timer;

editor.onUpdate(code => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        doMath(code);

        // Get the cursor position
        const cursorPos = editor.getCursor(); // Assuming CodeJar has a method to get cursor position

        // Extract the function name based on cursor position
        const functionName = extractFunctionName(code, cursorPos);

        // Display documentation for the extracted function
        if (functionName) {
            displayMathJSDocs(functionName);
        }
    }, wait);
});


hljs.configure({ ignoreUnescapedHTML: true });

const params = new URLSearchParams(window.location.search);
start(params.get('input'));


window.addEventListener('DOMContentLoaded', function() {
  var mobileWarning = document.getElementById('mobile-warning');
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
      mobileWarning.style.display = 'flex';
  }
});