// @ts-expect-error
import readme_html from "../README.md";
// @ts-expect-error
import teachers_html from "../teachers.md";

export const documents = {
    readme: readme_html,
    teachers: teachers_html,
    easter_egg: `<p style="text-align: center">Congratulations! You have solved the halting problem!</p>
        <p style="text-align: center"><img src="./public/confetti.gif" style="text-align: center; width: 50%" /></p>`
}

const document_dialog = document.getElementById("document-dialog") as HTMLDialogElement;
const document_title = document.getElementById("document-title") as HTMLHeadingElement;
const document_content = document.getElementById("document-content") as HTMLDivElement;

export const show_document = (title: string, content_html: string) => {
    document_title.innerText = title;
    document_content.innerHTML = content_html;

    document_dialog.showModal();
}

export const hide_document = () => {
    document_dialog.close();
}
