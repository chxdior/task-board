// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const modalWarningMessage = $('<p>')
    .text('Please make sure to fill out all three input boxes!!')
    .addClass('text-danger fw-bold');
const modalForm = $('form');

// Generate a unique task ID
function generateTaskId() {
    nextId++;
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return nextId;
}

// Create a task card
function createTaskCard(task) {
    const cardArea = $('<li>')
        .addClass('m-2')
        .attr('id', `task-${task.Id}`)
        .attr('style', 'background: white');

    const newCardHeaderEl = $('<h5>').addClass('card-header').text(task.title);
    const newCardContentEl = $('<div>').addClass('card-body');
    const newCardDescriptionEl = $('<p>').addClass('card-text').text(task.description);
    const newCardDueDateEl = $('<h6>').addClass('card-title').text(task.dueDate);
    const newCardDeleteButton = $('<button>')
        .attr('type', 'button')
        .addClass('btn btn-danger')
        .attr('id', task.Id)
        .text('delete')
        .click(function () {
            handleDeleteTask(task.Id);
        });

    // Set card color based on status
    if (task.status === 'overdue') {
        cardArea.addClass('bg-danger text-white');
        newCardDeleteButton.addClass('border border-light');
    } else if (task.status === 'dueSoon') {
        cardArea.addClass('bg-warning text-white');
    }

    newCardContentEl.append(newCardDescriptionEl, newCardDueDateEl, newCardDeleteButton);
    cardArea.append(newCardHeaderEl, newCardContentEl);

    return cardArea;
}
// Render the task list and make cards draggable
function renderTaskList() {
    const todoAreaEl = $('#todo-cards').html('');
    const todoListEl = $('<ul>').css('list-style-type', 'none')
        .addClass('connectedSortable card col-8 p-0 border-0 bg-light').attr('id', 'sortable1');
    const inProgressAreaEl = $('#in-progress-cards').html('');
    const inProgressListEl = $('<ul>').css('list-style-type', 'none').attr('id', 'sortable2')
        .addClass('connectedSortable card col-8 p-0 border-0 bg-light ');
    const doneAreaEl = $('#done-cards').html('');
    const doneListEl = $('<ul>').css('list-style-type', 'none').attr('id', 'sortable3')
        .addClass('connectedSortable card col-8 p-0 border-0 bg-light');
    todoAreaEl.addClass('h-100');
    inProgressAreaEl.addClass('h-100');
    doneAreaEl.addClass('h-100');

    // Render tasks based on state
    for (let task of taskList) {
        if (task.state === 'todo') {
            todoListEl.append(createTaskCard(task));
        } else if (task.state === 'inProgress') {
            inProgressListEl.append(createTaskCard(task));
        } else if (task.state === 'done') {
            doneListEl.append(createTaskCard(task));
        }
    }

    todoAreaEl.append(todoListEl);
    inProgressAreaEl.append(inProgressListEl);
    doneAreaEl.append(doneListEl);

}
// Handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const taskTitle = $('input[name="taskTitle"]').val();
    const taskDueDate = $('input[name="taskDueDate"]').val();
    const taskDescription = $('textarea[name="taskDescription"]').val();
    
    const timeToDeadline = dayjs(taskDueDate).diff(dayjs(), 'days');

    let taskStatus = '';
    if (timeToDeadline < 0) {
        taskStatus = 'overdue';
    } else if (timeToDeadline > 5) {
        taskStatus = 'noneUrgent';
    } else {
        taskStatus = 'dueSoon';
    }

    if (!taskTitle || !taskDueDate || !taskDescription) {
        if (!modalForm.find('.text-danger').length) {
            modalForm.append(modalWarningMessage);
        }
        return;
    }

    const newTask = {
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: taskStatus,
        state: 'todo',
        Id: generateTaskId()
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));

    renderTaskList();
    $("#sortable1, #sortable2, #sortable3").sortable("refresh");
}

// Handle deleting a task
function handleDeleteTask(taskId) {
    const confirmation = confirm('Are you sure you want to delete this task? This action is permanent.');
    if (confirmation) {
        taskList = taskList.filter(task => task.Id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable[0].id.split('-')[1];
    const newState = event.target.id === 'sortable1' ? 'todo'
        : event.target.id === 'sortable2' ? 'inProgress'
        : 'done';

    taskList = taskList.map(task => {
        if (task.Id == taskId) {
            task.state = newState;
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(taskList));
}

// Initialize page when it loads
$(document).ready(function () {
    renderTaskList();

    $('#formModal').on('submit', handleAddTask);

    $(function () {
        $('input[name="taskDueDate"]').datepicker();
        $("#sortable1, #sortable2, #sortable3").sortable({
            connectWith: ".connectedSortable",
            dropOnEmpty: true,
        }).droppable({
            drop: handleDrop
        });
    });
});