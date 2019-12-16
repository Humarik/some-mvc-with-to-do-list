class Model {
	constructor() {
		this.tasks = JSON.parse(localStorage.getItem('key')) || [];
	}

	initTask(text) {
		if (!text.trim()) return alert('you need to write something');
		const tasks = this.tasks;
		let id = this.tasks.length === 0 ? 1 : this.tasks[this.tasks.length - 1].id + 1;
		tasks.push({id: id, text: text, done: false});
		this.setLocalStorage(tasks);
	}

	bindTodoListChanged(callback) {
		this.onTodoListChanged = callback;
	}

	setLocalStorage(tasks) {
		this.onTodoListChanged(tasks);
		localStorage.setItem('key', JSON.stringify(tasks));
	}

	bindDeleteTask(id) {
		this.tasks = this.tasks.filter( task => task.id != id );
		this.setLocalStorage(this.tasks);
	}

	bindSwitchTask(id) {
		const tasks = this.tasks;
		tasks.map(task => {
			id == task.id ? task.done = !task.done : task
		})
		this.setLocalStorage(tasks);
	}

	bindEditTask(value, id) {
		const tasks = this.tasks;
		tasks.map(task => {
			id == task.id ? task.text = value : task
		})
		this.setLocalStorage(tasks);
	}
}

class View {
	constructor() {
		this.inProgress = document.querySelector('.inProgress');
		this.finished = document.querySelector('.finished');
		this.input = document.querySelector('.input');
		this.btn = document.querySelector('.btn');
		this.checkbox = document.querySelector('.checkbox');
	}

	bindAddTodo(handler) {
		this.btn.addEventListener('click', () => {
			const value = this.input.value;
			handler(value);
		})
	}

	drawTask(elem, done) {
		const parent = done === false ? this.inProgress : this.finished;
		parent.innerHTML += elem;
	}

	craeteTask(tasks) {
		if (tasks.length === 0) return this.inProgress.innerHTML = 'add task';
		this.inProgress.innerHTML = '';
		this.finished.innerHTML = '';

		tasks.reduce((acc, task) => {
			acc = `
			<div class='task' id= ${task.id}>
				<div class='delete-container'>
				<button class='delete-btn'>X</button>
				</div>
				<div class='text-container'>
					<input class='checkbox' type='checkbox' ${task.done === true ? `checked` : `''`}>
					<div class='text'> 
						<input class='edit-input'>
						<p class='text-item'> ${task.text} </p>
					</div>
					<button class='edit-btn'>Edit</button>
				</div>
			</div>
			`
			return this.drawTask(acc, task.done);
		}, this.inProgress);

		this.input.value = '';
	}

	bindDeleteTask(handler) {
		function deleteTask(e) {
			if (e.target.className !== 'delete-btn') return;
			handler(e.target.parentNode.parentNode.id);
		}

		this.inProgress.addEventListener('click', deleteTask);
		this.finished.addEventListener('click', deleteTask);
	}

	bindSwitchTask(handler) {
		function ChangeTask(e) {
			if (e.target.className !== 'checkbox') return
			handler(e.target.parentNode.parentNode.id);
		}
		this.inProgress.addEventListener('click', ChangeTask);
		this.finished.addEventListener('click', ChangeTask);

	}

	hideItem(elements) {
		elements.forEach(elem => {
			if (elem.className === 'edit-btn') {
				elem.style.visibility = 'hidden';
			}
		});
	}

	bindEditTask(handler) {
		this.inProgress.addEventListener('click', (e) => {
			const target = e.target;
			if (target.className !== 'edit-btn on' && target.className !== 'edit-btn') return;

			const taskDiv = target.parentNode.parentNode;
			const input = taskDiv.querySelector('.edit-input');
			const text = taskDiv.querySelector('.text-item');

			if (!target.classList.contains('on')) {
				taskDiv.querySelector('.edit-input').style.display = 'block';
				input.value = text.innerText;
				text.style.display = 'none';
				target.classList.add('on');
				this.hideItem(document.querySelectorAll('.edit-btn'));
			}else {
				// taskDiv.querySelector('.edit-input').style.display = 'none';
				// target.classList.toggle('on');
				handler(input.value, taskDiv.id);
			}
		});
	}
}

class Controller {
	constructor(model, view) {
		this.model = model;
		this.view = view;
		this.view.bindAddTodo(this.handleAddTodo);
		this.model.bindTodoListChanged(this.onTodoListChanged);
		this.view.bindDeleteTask(this.handleDeleteTask);
		this.view.bindSwitchTask(this.handleSwitchTask);
		this.view.bindEditTask(this.handleEditTask);
		this.onTodoListChanged(this.model.tasks);
	}

	handleAddTodo = todoText => {
		this.model.initTask(todoText);
	}

	onTodoListChanged = todos => {
		this.view.craeteTask(todos);
	}
	
	handleDeleteTask = id => {
		this.model.bindDeleteTask(id);
	}

	handleSwitchTask = id => {
		this.model.bindSwitchTask(id);
	}

	handleEditTask = (value, id) => {
		this.model.bindEditTask(value, id);
	}
}




const app = new Controller(new Model(), new View())

