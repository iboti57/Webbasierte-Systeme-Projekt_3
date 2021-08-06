//import axios, {AxiosResponse, AxiosError} from "axios"; // Diese Zeile vor der Ausführung auskommentieren!

let signInComp: HTMLElement;
let signOutComp: HTMLElement;
let tasksComp: HTMLElement;
let tasksTable: HTMLElement;
let alertComp: HTMLElement;

document.addEventListener("DOMContentLoaded", () => {
    signInComp = document.getElementById("signIn");
    signOutComp = document.getElementById("signOut");
    tasksComp = document.getElementById("tasks");
    tasksTable = document.getElementById("tasksTable");
    alertComp = document.getElementById("alert");

    document.getElementById("signInForm").addEventListener("submit", signIn);
    document.getElementById("signOutForm").addEventListener("submit", signOut);
    document.getElementById("formAddTask").addEventListener("submit", addTask);
    tasksTable.addEventListener("click", deleteTask);

    checkLogin();
});

function signIn(event: Event): void {
    event.preventDefault();
    const target: HTMLFormElement = event.currentTarget as HTMLFormElement;
    const formData: FormData = new FormData(target);

    axios.post("/signIn", {
        signInName: formData.get("signInName"),
        signInPass: formData.get("signInPass")
    }).then(() => {
        // Leer das Formular und blendet andere Seitenbereiche ein/aus
        target.reset();
        hide(signInComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    }).catch((err: AxiosError) => {
        switch (err.response.status) {
            case 404: //Not found
                printAlert("Nicht angemeldet");
                break;
            default: //Sonstige Fehler
                printAlert("Fehler: " + err.response.statusText);
                break;
        }
    });
}

function signOut(event: Event): void {
    event.preventDefault();
    axios.post("/signOut").finally(() => {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
        tasksTable.innerText = "";
    });
}

function addTask(event: Event): void {
    event.preventDefault();
    const target: HTMLFormElement = event.currentTarget as HTMLFormElement;
    const formData: FormData = new FormData(target);

    axios.post("/task", {
        taskName: formData.get("taskName"),
        taskDate: formData.get("taskDate")
    }).then(() => {
        target.reset();
        renderTasksList();
    }).catch((err: AxiosError) => {
        switch (err.response.status) {
            case 401: //Unauthorized
                printAlert("Nicht angemeldet");
                break;
            default: //Sonstige Fehler
                printAlert("Fehler: " + err.response.statusText);
                break;
        }
    });
}

function deleteTask(event: Event): void {
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    const target: HTMLElement = (event.target as HTMLElement).closest("button");

    // Wenn überhaupt der Button geklickt wurde und nicht irgendwas anderes in der Tabelle
    if (target !== null && target.classList.contains("delete")) {
        const id: string = target.dataset.taskid;

        axios.delete("/task/" + id).then(() => {
            renderTasksList();
        }).catch((err: AxiosError) => {
            switch (err.response.status) {
                case 404: //Not found
                    printAlert("Task nicht gefunden");
                    break;
                case 401: //Unauthorized
                    printAlert("Nicht angemeldet");
                    break;
                case 403: //Forbidden
                    printAlert("Nicht berechtigt");
                    break;
                default: //Sonstige Fehler
                    printAlert("Fehler: " + err.response.statusText);
                    break;
            }
        });
    }
}

function renderTasksList(): void {
    axios.get("/tasks").then((res: AxiosResponse) => {
        tasksTable.innerText = "";
        for (const task of res.data) {
            const row: HTMLElement = document.createElement("tr");
            row.innerHTML = `<td>${task.titel}</td>
                            <td>${task.faelligkeit}</td>
                            <td><button class="btn btn-primary delete"  data-taskid="${task.id}"><i class="fas fa-check"></i></button></td>
                            <td><button class="btn btn-primary update" data-taskid="${task.id}""><i class="fas fa-check"></i></button></td>
`;
            tasksTable.appendChild(row);
        }
    });
}

// Kleine Hilfsfunktion, die beim Seitenaufruf schon prüft, ob ein aktiver Login existiert
function checkLogin(): void {
    axios.get("/isLoggedIn").then(() => {
        hide(signInComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    }).catch(() => {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
    });
}

// Gibt Fehlermeldungen für 10 Sekunden auf der Seite aus
function printAlert(msg: string): void {
    alertComp.innerHTML = `<p class="text-danger">${msg}</p>`
    setTimeout(() => {
        hide(alertComp);
    }, 10000);
    show(alertComp);
}

function show(elem: HTMLElement): void {
    elem.style.display = "block";
}

function hide(elem: HTMLElement): void {
    elem.style.display = "none";
}