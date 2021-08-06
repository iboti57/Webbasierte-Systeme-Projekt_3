//import axios, {AxiosResponse, AxiosError} from "axios"; // Diese Zeile vor der Ausführung auskommentieren!
var signInComp;
var signOutComp;
var tasksComp;
var tasksTable;
var alertComp;
document.addEventListener("DOMContentLoaded", function () {
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
function signIn(event) {
    event.preventDefault();
    var target = event.currentTarget;
    var formData = new FormData(target);
    axios.post("/signIn", {
        signInName: formData.get("signInName"),
        signInPass: formData.get("signInPass")
    }).then(function () {
        // Leer das Formular und blendet andere Seitenbereiche ein/aus
        target.reset();
        hide(signInComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    }).catch(function (err) {
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
function signOut(event) {
    event.preventDefault();
    axios.post("/signOut").finally(function () {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
        tasksTable.innerText = "";
    });
}
function addTask(event) {
    event.preventDefault();
    var target = event.currentTarget;
    var formData = new FormData(target);
    axios.post("/task", {
        taskName: formData.get("taskName"),
        taskDate: formData.get("taskDate")
    }).then(function () {
        target.reset();
        renderTasksList();
    }).catch(function (err) {
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
function deleteTask(event) {
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    var target = event.target.closest("button");
    // Wenn überhaupt der Button geklickt wurde und nicht irgendwas anderes in der Tabelle
    if (target !== null && target.classList.contains("delete")) {
        var id = target.dataset.taskid;
        axios.delete("/task/" + id).then(function () {
            renderTasksList();
        }).catch(function (err) {
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
function renderTasksList() {
    axios.get("/tasks").then(function (res) {
        tasksTable.innerText = "";
        for (var _i = 0, _a = res.data; _i < _a.length; _i++) {
            var task = _a[_i];
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + task.titel + "</td>\n                            <td>" + task.faelligkeit + "</td>\n                            <td><button class=\"btn btn-primary delete\"  data-taskid=\"" + task.id + "\"><i class=\"fas fa-check\"></i></button></td>\n                            <td><button class=\"btn btn-primary update\" data-taskid=\"" + task.id + "\"\"><i class=\"fas fa-check\"></i></button></td>\n";
            tasksTable.appendChild(row);
        }
    });
}
// Kleine Hilfsfunktion, die beim Seitenaufruf schon prüft, ob ein aktiver Login existiert
function checkLogin() {
    axios.get("/isLoggedIn").then(function () {
        hide(signInComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    }).catch(function () {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
    });
}
// Gibt Fehlermeldungen für 10 Sekunden auf der Seite aus
function printAlert(msg) {
    alertComp.innerHTML = "<p class=\"text-danger\">" + msg + "</p>";
    setTimeout(function () {
        hide(alertComp);
    }, 10000);
    show(alertComp);
}
function show(elem) {
    elem.style.display = "block";
}
function hide(elem) {
    elem.style.display = "none";
}
