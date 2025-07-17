# Ture on the web

See also: <a href="https://github.com/obfuscatedgenerated/Ture" target="_blank">the original Java implementation</a>.

## Usage

You can enter the formal descriptions of transition rules as described in the [syntax section](#syntax) in the text area at the bottom. This will be validated against syntax errors in real time.

You can use the `Copy empty letter` button (`Alt+E`) to copy the empty letter symbol `⬚` to your clipboard. This is useful for pasting into the rules.

You can enter the tape contents to feed to a program in the input at the top. It will automatically expand to the correct size as you type or paste.

You can select the initial state to start the program from with the dropdown. This will automatically be populated from the rules you enter.

You can use the `Run program` button (`F8`) to run the program in one go. This will replace the contents of the tape with the final result.

You can use the `Run step-by-step` button (`F9`) to enter stepped execution mode. You can step through the program with the `Next step` button (`F9`). The position of the pointer will be reflected under the tape cells. The tape cell values will be replaced by each step. The current state and step number is displayed below the tape. The transition rule that was just followed to reach the current state will be highlighted in the editor. You can press the `Cancel` button (`Esc`) to halt the step-by-step execution.

You can name the program with the `Program name` field above the editor.

You can download the program as a .ture file with the `Download .ture file` button (`Ctrl+S` or `Cmd+S`).

You can upload either a .txt of just the rules or a .ture file with the rules and init state with the `Upload from file` button (`Ctrl+O` or `Cmd+O`). The file will be parsed and the rules will be loaded into the editor. If an init state is declared, it will be set as the initial state in the dropdown.

You can copy a URL of the encoded program alongside the name, tape, and init state with the `Copy Share URL` button (`Ctrl+Alt+S` or `Cmd+Alt+S`). This URL can be shared with others to run the same program when they open the link.

## Syntax

The website will load to `LastFirst.ture` as an example file.

### Rules

Rules are defined in the following format:

```
(state, letter) -> (state, letter, direction)
```

Where `state` is the name of the state, `letter` is the symbol on the tape at the current position, `direction` is either `left` or `right` and `state` is the name of the next state.

When the pointer is over the given letter whilst in the given state on the LHS, it overwrites the letter with the new letter, changes to the new state, and moves the pointer in the direction specified on the RHS.

If no applicable rule is found, the machine halts.

The empty letter is represented by the symbol `⬚`.

The state names must not contain any of `,()⬚` or whitespace and letters must be a single character that is not `,()` or whitespace. It is convention to start state names with `q` but this is not enforced.

It is recommended to add a newline at the end of each rule, but this is optional. Whitespace is also allowed before and after rules.

Whitespace is permitted between tokens of the rule, but not within tokens such as state names or letters.

### Comments

Comments start with `%` and can be placed anywhere in the program. Comments run from the `%` to the end of the line.

You can escape with `\%`.
