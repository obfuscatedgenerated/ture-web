# Ture

> A turing machine interpreter.

See also: <a href="https://github.com/obfuscatedgenerated/Ture" target="_blank" rel="noopener noreferrer">the original Java implementation</a>.

## Usage

> If you're looking to run Ture locally, see <a href="https://github.com/obfuscatedgenerated/ture-web/blob/main/SETUP.md" target="_blank" rel="noopener noreferrer">SETUP.md</a> in the repository.

> If you're an educator looking to use Ture in your materials, click the "Teachers" link in the top navigation bar, or see <a href="https://github.com/obfuscatedgenerated/ture-web/blob/main/TEACHERS.md" target="_blank" rel="noopener noreferrer">TEACHERS.md</a> in the repository.

You can enter the formal descriptions of transition rules as described in the [syntax section](#syntax) in the text area at the bottom. This will be validated against syntax errors in real time.

You can use the `Copy empty letter` button (<kbd>Alt</kbd><span class="kbd-plus">+</span><kbd>E</kbd>) to copy the empty letter symbol `⬚` to your clipboard. This is useful for pasting into the rules.

You can enter the tape contents to feed to a program in the input at the top. It will automatically expand to the correct size as you type or paste.

You can select the initial state to start the program from with the dropdown. This will automatically be populated from the rules you enter.

You can use the `Run program` button (<kbd>F8</kbd>) to run the program in one go. This will replace the contents of the tape with the final result.

You can use the `Run step-by-step` button (<kbd>F9</kbd>) to enter stepped execution mode. You can step through the program with the `Next step` button (<kbd>F9</kbd>). The position of the pointer will be reflected under the tape cells. The tape cell values will be replaced by each step. The current state and step number is displayed below the tape. The transition rule that was just followed to reach the current state will be highlighted in the editor. You can press the `Cancel` button (<kbd>Esc</kbd>) to halt the step-by-step execution. You can press `Run remaining` (<kbd>F8</kbd>) to execute the remaining steps of the program to the end without stepping.

You can name the program with the `Program name` field above the editor.

You can download the program as a .ture file with the `Download .ture file` button (<kbd>Ctrl</kbd><span class="kbd-plus">+</span><kbd>S</kbd> or <kbd>Cmd</kbd><span class="kbd-plus">+</span><kbd>S</kbd>).

You can upload either a .txt of just the rules or a .ture file with the rules and init state with the `Upload from file` button (<kbd>Ctrl</kbd><span class="kbd-plus">+</span><kbd>O</kbd> or <kbd>Cmd</kbd><span class="kbd-plus">+</span><kbd>O</kbd>). The file will be parsed and the rules will be loaded into the editor. If an init state is declared, it will be set as the initial state in the dropdown.

You can copy a URL of the encoded program alongside the name, tape, and init state with the `Create share URL` button (<kbd>Ctrl</kbd><span class="kbd-plus">+</span><kbd>Alt</kbd><span class="kbd-plus">+</span><kbd>S</kbd> or <kbd>Cmd</kbd><span class="kbd-plus">+</span><kbd>Alt</kbd><span class="kbd-plus">+</span><kbd>S</kbd>). This URL can be shared with others to run the same program when they open the link. You have the option of which properties you want to share and whether to make them read only. You can choose to copy the link or generate an iframe embed code to include in your own website or application.

You can the select `State graph` tab to view a graph of the state and letter transitions. In step-by-step mode, the edge that was just followed is highlighted in magenta.

## Syntax

You can check the example programs, such as <a target="_blank" rel="noopener" href="https://ture.ollieg.codes/?script=KQAgygLg9gTgpiCALBAzAljAzhEAbOCCOGEdAO0RRAHdYATEAQy2ZByeICgAKARwCS5dBAA0zAJQgAtAD4Q-AILim4mOgDmSCBN6DhYkACMpchXwBC4o2s3bdXUAFkoANwTQqCOOUZRUXohMAA5wesqSMvJKKrZaOuHWptF8ETYg6vG6-FaRZjmxGXYJBcbJ5rnpmfZcjiAWTADGANYQME3NIFDkjQg0KJQ0CPBNSIE%2BfgHIHiFhMSCAWNTl-ACivhEL4gSoJZbiS1Hma-S5m-hwOw6gAEpwwXhNHtQPOOdEJLQiY9MgGNi4BHepCYvhAPmIpB%2BbRC7AgnDmfGOESYyz4AAkmHhDKoilk9Eikod%2BBisYVqrtjrkUUT0ZjDFVitlEb5KqiSfS4vYgA&name=LastFirst&name_ro=true&init=qInit">LastFirst</a> for examples of valid syntax.

### Rules

Rules are defined in the following format:

```
(from_state, from_letter) -> (to_state, to_letter, direction)
```

When the pointer is over the given letter whilst in the given state on the LHS, it overwrites the letter with the new letter, changes to the new state, and moves the pointer in the direction specified on the RHS.

If no applicable rule is found, the machine halts.

The empty letter is represented by the symbol `⬚`.

The state names must not contain any of `,()⬚` or whitespace and letters must be a single character that is not `,()` or whitespace. It is convention to start state names with `q` but this is not enforced.

It is recommended to add a newline at the end of each rule, but this is optional. Whitespace is also allowed before and after rules.

Whitespace is permitted between tokens of the rule, but not within tokens such as state names or letters.

### Comments

Comments start with `%` and can be placed anywhere in the program. Comments run from the `%` to the end of the line.

You can escape with `\%`.
