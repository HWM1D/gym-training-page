class WorkoutTracker {
    constructor() {
        this.exercises = [];
        this.currentPhase = 'setup';
        this.currentExerciseIndex = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // عناصر فاز تنظیمات
        this.exerciseNameInput = document.getElementById('exercise-name');
        this.setsCountInput = document.getElementById('sets-count');
        this.addExerciseBtn = document.getElementById('add-exercise-btn');
        this.exercisesList = document.getElementById('exercises-list');
        this.startWorkoutBtn = document.getElementById('start-workout-btn');

        // عناصر فاز تمرین
        this.workoutExercises = document.getElementById('workout-exercises');
        this.finishWorkoutBtn = document.getElementById('finish-workout-btn');

        // عناصر فاز خلاصه
        this.workoutSummary = document.getElementById('workout-summary');
        this.newWorkoutBtn = document.getElementById('new-workout-btn');

        // عناصر مودال
        this.repsModal = document.getElementById('reps-modal');
        this.modalExerciseName = document.getElementById('modal-exercise-name');
        this.setsTableContainer = document.getElementById('sets-table-container');
        this.closeModalBtn = document.getElementById('close-modal');
        this.saveRepsBtn = document.getElementById('save-reps-btn');

        // فازها
        this.setupPhase = document.getElementById('setup-phase');
        this.workoutPhase = document.getElementById('workout-phase');
        this.summaryPhase = document.getElementById('summary-phase');
    }

    attachEventListeners() {
        // فاز تنظیمات
        this.addExerciseBtn.addEventListener('click', () => this.addExercise());
        this.exerciseNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExercise();
        });
        this.setsCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExercise();
        });
        this.startWorkoutBtn.addEventListener('click', () => this.startWorkout());

        // فاز تمرین
        this.finishWorkoutBtn.addEventListener('click', () => this.finishWorkout());

        // فاز خلاصه
        this.newWorkoutBtn.addEventListener('click', () => this.newWorkout());

        // مودال
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.saveRepsBtn.addEventListener('click', () => this.saveReps());
        
        // بستن مودال با کلیک روی پس‌زمینه
        this.repsModal.addEventListener('click', (e) => {
            if (e.target === this.repsModal) this.closeModal();
        });
    }

    addExercise() {
        const name = this.exerciseNameInput.value.trim();
        const sets = parseInt(this.setsCountInput.value);

        if (!name) {
            this.showNotification('لطفاً نام حرکت را وارد کنید', 'error');
            return;
        }

        if (!sets || sets < 1 || sets > 10) {
            this.showNotification('تعداد ست باید بین 1 تا 10 باشد', 'error');
            return;
        }

        // بررسی تکراری بودن نام حرکت
        if (this.exercises.some(ex => ex.name === name)) {
            this.showNotification('این حرکت قبلاً اضافه شده است', 'error');
            return;
        }

        const exercise = {
            id: Date.now(),
            name: name,
            sets: sets,
            reps: new Array(sets).fill(0),
            completed: false
        };

        this.exercises.push(exercise);
        this.renderExercisesList();
        this.clearInputs();
        this.updateStartButton();
        
        this.showNotification('حرکت با موفقیت اضافه شد', 'success');
    }

    renderExercisesList() {
        this.exercisesList.innerHTML = '';
        
        this.exercises.forEach((exercise, index) => {
            const exerciseElement = document.createElement('div');
            exerciseElement.className = 'exercise-item';
            exerciseElement.innerHTML = `
                <div class="exercise-info">
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-sets">${exercise.sets} ست</div>
                </div>
                <button class="delete-btn" onclick="workoutTracker.deleteExercise(${index})">
                    حذف
                </button>
            `;
            this.exercisesList.appendChild(exerciseElement);
        });
    }

    deleteExercise(index) {
        this.exercises.splice(index, 1);
        this.renderExercisesList();
        this.updateStartButton();
        this.showNotification('حرکت حذف شد', 'success');
    }

    clearInputs() {
        this.exerciseNameInput.value = '';
        this.setsCountInput.value = '';
        this.exerciseNameInput.focus();
    }

    updateStartButton() {
        if (this.exercises.length > 0) {
            this.startWorkoutBtn.style.display = 'block';
        } else {
            this.startWorkoutBtn.style.display = 'none';
        }
    }

    startWorkout() {
        if (this.exercises.length === 0) {
            this.showNotification('حداقل یک حرکت اضافه کنید', 'error');
            return;
        }

        this.switchPhase('workout');
        this.renderWorkoutExercises();
    }

    renderWorkoutExercises() {
        this.workoutExercises.innerHTML = '';
        
        this.exercises.forEach((exercise, index) => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = `workout-exercise-card ${exercise.completed ? 'completed' : ''}`;
            exerciseCard.onclick = () => this.openRepsModal(index);
            
            const completedSets = exercise.reps.filter(rep => rep > 0).length;
            const totalReps = exercise.reps.reduce((sum, reps) => sum + reps, 0);
            const progressText = exercise.completed 
                ? `✅ تکمیل شده - مجموع: ${totalReps} تکرار` 
                : `${completedSets}/${exercise.sets} ست تکمیل شده`;

            exerciseCard.innerHTML = `
                <h3>${exercise.name}</h3>
                <p>تعداد ست: ${exercise.sets}</p>
                <div class="exercise-progress">${progressText}</div>
            `;
            
            this.workoutExercises.appendChild(exerciseCard);
        });
    }

    openRepsModal(exerciseIndex) {
        this.currentExerciseIndex = exerciseIndex;
        const exercise = this.exercises[exerciseIndex];
        
        this.modalExerciseName.textContent = exercise.name;
        this.renderSetsTable(exercise);
        this.repsModal.classList.add('active');
    }

    renderSetsTable(exercise) {
        const table = document.createElement('table');
        table.className = 'sets-table';
        
        // هدر جدول
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>ست</th>
            <th>تعداد تکرار</th>
        `;
        table.appendChild(headerRow);

        // ردیف‌های ست‌ها
        for (let i = 0; i < exercise.sets; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>ست ${i + 1}</td>
                <td>
                    <input type="number" 
                           id="reps-${i}" 
                           value="${exercise.reps[i] || ''}" 
                           min="0" 
                           max="999"
                           placeholder="0">
                </td>
            `;
            table.appendChild(row);
        }

        this.setsTableContainer.innerHTML = '';
        this.setsTableContainer.appendChild(table);
    }

    closeModal() {
        this.repsModal.classList.remove('active');
        this.currentExerciseIndex = null;
    }

    saveReps() {
        if (this.currentExerciseIndex === null) return;

        const exercise = this.exercises[this.currentExerciseIndex];
        let hasValidReps = false;

        // جمع‌آوری داده‌های تکرار
        for (let i = 0; i < exercise.sets; i++) {
            const repsInput = document.getElementById(`reps-${i}`);
            const reps = parseInt(repsInput.value) || 0;
            exercise.reps[i] = reps;
            if (reps > 0) hasValidReps = true;
        }

        // به‌روزرسانی وضعیت تکمیل
        exercise.completed = hasValidReps && exercise.reps.every(rep => rep > 0);

        this.closeModal();
        this.renderWorkoutExercises();
        this.showNotification('تکرارها ذخیره شد', 'success');
    }

    finishWorkout() {
        const completedExercises = this.exercises.filter(ex => ex.completed).length;
        
        if (completedExercises === 0) {
            this.showNotification('حداقل یک حرکت را تکمیل کنید', 'error');
            return;
        }

        this.switchPhase('summary');
        this.renderWorkoutSummary();
    }

    renderWorkoutSummary() {
        this.workoutSummary.innerHTML = '';
        
        this.exercises.forEach(exercise => {
            if (exercise.reps.some(rep => rep > 0)) {
                const summaryElement = document.createElement('div');
                summaryElement.className = 'summary-exercise';
                
                const setsHTML = exercise.reps.map((reps, index) => {
                    if (reps > 0) {
                        return `<div class="summary-set">ست ${index + 1}: ${reps} تکرار</div>`;
                    }
                    return '';
                }).join('');

                const totalReps = exercise.reps.reduce((sum, reps) => sum + reps, 0);

                summaryElement.innerHTML = `
                    <h3>${exercise.name}</h3>
                    <p>مجموع تکرارها: ${totalReps}</p>
                    <div class="summary-sets">${setsHTML}</div>
                `;
                
                this.workoutSummary.appendChild(summaryElement);
            }
        });

        // اضافه کردن آمار کلی
        const totalExercises = this.exercises.filter(ex => ex.reps.some(rep => rep > 0)).length;
        const totalSets = this.exercises.reduce((sum, ex) => 
            sum + ex.reps.filter(rep => rep > 0).length, 0);
        const totalReps = this.exercises.reduce((sum, ex) => 
            sum + ex.reps.reduce((exSum, reps) => exSum + reps, 0), 0);

        const statsElement = document.createElement('div');
        statsElement.className = 'summary-exercise';
        statsElement.innerHTML = `
            <h3>📊 آمار کلی تمرین</h3>
            <div class="summary-sets">
                <div class="summary-set">تعداد حرکات: ${totalExercises}</div>
                <div class="summary-set">تعداد ست‌ها: ${totalSets}</div>
                <div class="summary-set">مجموع تکرارها: ${totalReps}</div>
            </div>
        `;
        
        this.workoutSummary.insertBefore(statsElement, this.workoutSummary.firstChild);
    }

    newWorkout() {
        this.exercises = [];
        this.currentExerciseIndex = null;
        this.switchPhase('setup');
        this.renderExercisesList();
        this.updateStartButton();
        this.clearInputs();
        this.showNotification('تمرین جدید آماده است', 'success');
    }

    switchPhase(phase) {
        // مخفی کردن همه فازها
        this.setupPhase.classList.remove('active');
        this.workoutPhase.classList.remove('active');
        this.summaryPhase.classList.remove('active');

        // نمایش فاز مورد نظر
        switch(phase) {
            case 'setup':
                this.setupPhase.classList.add('active');
                break;
            case 'workout':
                this.workoutPhase.classList.add('active');
                break;
            case 'summary':
                this.summaryPhase.classList.add('active');
                break;
        }
        
        this.currentPhase = phase;
    }

    showNotification(message, type = 'info') {
        // ایجاد المان نوتیفیکیشن
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInNotification 0.3s ease-out;
            max-width: 300px;
        `;

        // رنگ‌بندی بر اساس نوع
        switch(type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // حذف خودکار بعد از 3 ثانیه
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// اضافه کردن انیمیشن‌های نوتیفیکیشن به CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotification {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutNotification {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// راه‌اندازی اپلیکیشن
const workoutTracker = new WorkoutTracker();