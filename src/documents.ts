// @ts-expect-error
import readme_html from "../README.md";
// @ts-expect-error
import teachers_html from "../TEACHERS.md";
// @ts-expect-error
import examples_html from "../examples.md";

export const documents = {
    readme: readme_html.replaceAll("https://ture.ollieg.codes/?", "./?"),
    teachers: teachers_html.replaceAll("https://ture.ollieg.codes/?", "./?"),
    examples: examples_html.replaceAll("https://ture.ollieg.codes/?", "./?"),
    easter_egg: `<p style="text-align: center">Congratulations! You have solved the halting problem!</p>
        <p style="text-align: center"><img src="./public/precache/confetti.gif" style="text-align: center; width: 50%" /></p>`,
}

const document_dialog = document.getElementById("document-dialog") as HTMLDialogElement;
const document_title = document.getElementById("document-title") as HTMLHeadingElement;
const document_content = document.getElementById("document-content") as HTMLDivElement;

/**
 * Renders and shows a document in the dialog.
 * @param title The title to present in the heading
 * @param content_html The HTML or element to display in the dialog
 */
export const show_document = (title: string, content_html: string | HTMLElement) => {
    document_title.innerText = title;

    if (typeof content_html === "string") {
        document_content.innerHTML = content_html;
    } else if (content_html instanceof HTMLElement) {
        // clear existing content
        document_content.innerHTML = "";

        // append the provided HTML element
        document_content.appendChild(content_html);
    }

    document_dialog.dataset.title = title;

    // see if content can be resolved to a built in document
    const doc_key = (Object.keys(documents) as (keyof typeof documents)[]).find(key => documents[key] === content_html);
    if (doc_key) {
        document_dialog.dataset.known_doc = doc_key;
    } else if (document_dialog.dataset.known_doc) {
        delete document_dialog.dataset.known_doc;
    }

    document_dialog.showModal();
    document_content.scrollTop = 0;
}

/**
 * Closes the document dialog.
 */
export const hide_document = () => {
    document_dialog.close();
}
