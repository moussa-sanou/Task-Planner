//----------------task list library----------------------------
"use strict";

const taskList = ( () => {
    let tasks = [];                 // private variable
    return {                        // define object
        load() {                    // public method
            tasks = storage.retrieve();
            return this;
        },
        save() {                    // public method
            storage.store(tasks);
            return this;
        },
        sort() {
            tasks.sort( (task1, task2) => {
                if (task1.dueDate < task2.dueDate) { 
                    return -1;
                } else if (task1.dueDate > task2.dueDate) { 
                    return 1;
                } else {
                    return 0;
                }
            });
            return this;
        },
        add(task) {
            tasks.push(task);
            return this;
        },
        delete(i) {
            this.sort();
            tasks.splice(i, 1);
            return this;
        },
        clear() {
            storage.clear();
            return this;
        }, 
        *[Symbol.iterator]() {                 // define the iterator() method
            for (let task of tasks) {
                yield task;
            }
        }    
    };
})(); 



class Task {
    constructor({description, dueDate}) {
        this.description = description;
        if (dueDate) {
            this.dueDate = new Date(dueDate);
        } else {
            this.dueDate = new Date();
            this.dueDate.setMonth(this.dueDate.getMonth() + 1);
        }
    }

    get isValid() {
        if (this.description === "") {   // The task need to have a name
            return false;
        }
        const today = new Date();        // Only future data can be accepted
        if (this.dueDate.getTime() <= today.getTime() ) { 
            return false;
        }
        return true;
    }

    toString() {
        return `${this.description}<br>
                Due Date: ${this.dueDate.toDateString()}`;
    }
}

//----------------Library storage----------------------------


const storage = {
    retrieve() { 
        const tasks = [];
        const json = localStorage.E17tasks;
        if(json) {
            const taskArray = JSON.parse(json);
            for(let obj of taskArray) {
                tasks.push(new Task(obj)); 
            }
        }
        return tasks;
    },
    store(tasks) { 
        localStorage.E17tasks = JSON.stringify(tasks); 
    },
    clear() { 
        localStorage.E17tasks = ""; 
    }
};

//----------------Task displays----------------------------




const displayTasks = () => {
    taskList.tasks = [];   
    taskList.sort();

    let html = "";
    for (const task of taskList) {
        html += "<p><a href='#'>Delete</a>" + task.toString() + "</p>";
    }    
    $("#tasks").html(html);

    // add click event handler to each <a> element
    $("#tasks").find("a").each( (index, a) => {
        $(a).click( evt => {
            taskList.load().delete(index).save();
            displayTasks();
            evt.preventDefault(); 
            $("input:first").focus();
        });
    });
}

$(document).ready( () => {
    $("#add_task").click( () => {
        const taskObj = {                   
            description: $("#task").val(),
            dueDate: $("#due_date").val()
        };
        const newTask = new Task(taskObj);  
        
        if (newTask.isValid) {
            taskList.load().add(newTask).save();
            displayTasks();
            $("#task").val("");
            $("#due_date").val("");
        } else {
            alert("Please enter a task and/or " + 
                  "a due date that's in the future.");
        }
        $("#task").select();
    });
    
    $("#clear_tasks").click( () => {
        taskList.clear();
        $("#tasks").html("");
        $("#task").val("");
        $("#due_date").val("");
        $("#task").focus();
    });   
    
    taskList.load()
    displayTasks();
    $("#task").focus();
});

