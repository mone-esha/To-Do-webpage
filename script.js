(function () {
  // ---------- STATE ----------
  let tasks = [];
  let currentFilter = 'all';
  let editingId = null;

  // ---------- DOM ----------
  const taskListEl = document.getElementById('taskList');
  const titleInput = document.getElementById('taskTitle');
  const dateInput = document.getElementById('taskDate');
  const prioritySelect = document.getElementById('taskPriority');
  const tagsInput = document.getElementById('taskTags');
  const addBtn = document.getElementById('addTaskBtn');
  const addBtnLabel = document.getElementById('addBtnLabel');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const addCard = document.getElementById('addCard');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const themeToggle = document.getElementById('themeToggle');
  const toggleThumb = document.getElementById('toggleThumb');
  const progressPercent = document.getElementById('progressPercent');
  const progressFill = document.getElementById('progressFill');
  const progressBuddy = document.getElementById('progressBuddy');
  const progressMsg = document.getElementById('progressMsg');
  const typedTitle = document.getElementById('typedTitle');
  const caret = document.getElementById('caret');

  // ---------- HELPERS ----------
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const escapeHtml = (text) => {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  };

  const parseTags = (str) =>
    str.split(',').map(t => t.trim()).filter(Boolean);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const mon = (d.getMonth() + 1).toString().padStart(2, '0');
    const hrs = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${mon} · ${hrs}:${min}`;
  };

  const priorityEmoji = { high: '🔥', medium: '🌸', low: '🍃' };

  // ---------- TYPING ANIMATION FOR TITLE ----------
  function typeTitle() {
    const text = 'To-Do Web';
    let i = 0;
    typedTitle.textContent = '';
    caret.classList.remove('done');
    caret.style.display = 'inline-block';

    function step() {
      if (i < text.length) {
        typedTitle.textContent += text.charAt(i);
        i++;
        
        const delay = 70 + Math.random() * 60;
        setTimeout(step, delay);
      } else {
        
        caret.classList.add('done');
      }
    }
    setTimeout(step, 400);
  }

  // ---------- THEME ----------
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    toggleThumb.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('todo-theme', dark ? 'dark' : 'light');
  }

  function loadTheme() {
    const saved = localStorage.getItem('todo-theme');
    if (saved) return applyTheme(saved === 'dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });

  // ---------- RENDER ----------
  function render() {
    const visible = tasks.filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressBuddy.style.left = `${percent}%`;

    if (percent === 0) {
      progressBuddy.textContent = '🐣';
      progressMsg.textContent = "Let's get started! ✨";
    } else if (percent < 30) {
      progressBuddy.textContent = '🌱';
      progressMsg.textContent = 'Nice start, keep going! ';
    } else if (percent < 60) {
      progressBuddy.textContent = '🌸';
      progressMsg.textContent = "You're blooming! ";
    } else if (percent < 90) {
      progressBuddy.textContent = '🌟';
      progressMsg.textContent = 'So close to the finish! ';
    } else if (percent < 100) {
      progressBuddy.textContent = '🧁';
      progressMsg.textContent = 'You are almost there! 🍓';
    } else {
      progressBuddy.textContent = '👑';
      progressMsg.textContent = 'You did it!';
    }

    if (visible.length === 0) {
      taskListEl.innerHTML = `
        <li class="empty-state">
          <span class="empty-emoji">${total === 0 ? '' : '🔍'}</span>
          <p>${total === 0 ? 'No tasks yet.' : 'Nothing here!'}</p>
          <p class="empty-sub">${total === 0 ? 'Add your first one above ' : 'Try a different filter '}</p>
        </li>
      `;
      return;
    }

    taskListEl.innerHTML = visible.map(task => {
      const dateStr = formatDate(task.dueDate);
      const tagsHtml = (task.tags || [])
        .map(tag => `<span class="meta-pill tag"><span class="emoji">🏷️</span>${escapeHtml(tag)}</span>`)
        .join('');

      const dateHtml = dateStr
        ? `<span class="meta-pill date"><span class="emoji">📅</span>${dateStr}</span>`
        : '';

      const priorityHtml = `
        <span class="meta-pill priority-${task.priority}">
          <span class="emoji">${priorityEmoji[task.priority] || '🌸'}</span>
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      `;

      const editingClass = editingId === task.id ? 'editing-highlight' : '';

      return `
        <li class="task-item ${task.completed ? 'completed' : ''} ${editingClass}" data-id="${task.id}" data-priority="${task.priority}">
          <button class="task-check ${task.completed ? 'completed' : ''}" data-action="toggle" aria-label="Toggle complete">
            <i class="fas fa-check"></i>
          </button>
          <div class="task-content">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <div class="task-meta">
              ${priorityHtml}
              ${dateHtml}
              ${tagsHtml}
            </div>
          </div>
          <div class="task-actions">
            <button class="task-edit" data-action="edit" aria-label="Edit task">
              <i class="fas fa-pen"></i>
            </button>
            <button class="task-delete" data-action="delete" aria-label="Delete task">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </li>
      `;
    }).join('');
  }

  // ---------- ADD / UPDATE ----------
  function submitTask() {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    if (editingId) {
      // update existing
      const t = tasks.find(x => x.id === editingId);
      if (t) {
        t.title = title;
        t.dueDate = dateInput.value || null;
        t.priority = prioritySelect.value;
        t.tags = parseTags(tagsInput.value);
      }
      exitEditMode();
    } else {
      // create new
      tasks.push({
        id: uid(),
        title,
        completed: false,
        dueDate: dateInput.value || null,
        priority: prioritySelect.value,
        tags: parseTags(tagsInput.value),
        createdAt: new Date().toISOString()
      });
      resetForm();
    }

    titleInput.focus();
    save();
    render();
  }

  function resetForm() {
    titleInput.value = '';
    dateInput.value = '';
    prioritySelect.value = 'medium';
    tagsInput.value = '';
  }

  // ---------- EDIT MODE ----------
  function enterEditMode(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    editingId = id;

    titleInput.value = t.title;
    dateInput.value = t.dueDate || '';
    prioritySelect.value = t.priority;
    tagsInput.value = (t.tags || []).join(', ');

    addCard.classList.add('editing');
    addBtnLabel.textContent = 'Save';
    cancelEditBtn.classList.remove('hidden');

    titleInput.focus();
    // scroll add card into view for mobile
    addCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    render();
  }

  function exitEditMode() {
    editingId = null;
    addCard.classList.remove('editing');
    addBtnLabel.textContent = 'Add';
    cancelEditBtn.classList.add('hidden');
    resetForm();
    render();
  }

  // ---------- TOGGLE ----------
  function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    if (t) {
      t.completed = !t.completed;
      save();
      render();
    }
  }

  // ---------- DELETE ----------
  function deleteTask(id) {
    if (editingId === id) exitEditMode();
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  // ---------- EVENTS ----------
  addBtn.addEventListener('click', submitTask);

  cancelEditBtn.addEventListener('click', exitEditMode);

  titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitTask();
    }
  });

  // Esc key cancels edit mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingId) {
      exitEditMode();
    }
  });

  taskListEl.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    const action = actionEl.dataset.action;
    if (action === 'toggle') toggleTask(id);
    if (action === 'delete') deleteTask(id);
    if (action === 'edit') enterEditMode(id);
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // ---------- STORAGE ----------
  function save() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }

  function load() {
    const raw = localStorage.getItem('todo-tasks');
    if (raw) {
      try { tasks = JSON.parse(raw); } catch { tasks = []; }
    } else {
      tasks = [
        {
          id: uid(),
          title: 'Welcome!',
          completed: false,
          dueDate: null,
          priority: 'medium',
          tags: ['welcome'],
          createdAt: new Date().toISOString()
        },
        {
          id: uid(),
          title: 'Tap the circle to finish a task',
          completed: true,
          dueDate: null,
          priority: 'low',
          tags: ['tip'],
          createdAt: new Date().toISOString()
        }
      ];
    }
    render();
  }

  // ---------- INIT ----------
  loadTheme();
  load();
  typeTitle();
})();