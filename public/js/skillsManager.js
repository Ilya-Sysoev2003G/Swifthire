// public/js/profile/skillsManager.js
class SkillsManager {
  constructor() {
    this.skills = [];
    this.skillsContainer = document.getElementById('skillsContainer');
    this.skillInput = document.getElementById('skillInput');
    this.addButton = document.getElementById('addSkillBtn');
    
    this.init();
  }
  
  async init() {
    await this.loadSkills();
    this.setupEventListeners();
  }
  
  async loadSkills() {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      this.skills = data.skills || [];
      this.renderSkills();
    } catch (error) {
      console.error('Ошибка загрузки навыков:', error);
    }
  }
  
  renderSkills() {
    if (!this.skillsContainer) return;
    
    this.skillsContainer.innerHTML = '';
    
    if (this.skills.length === 0) {
      this.skillsContainer.innerHTML = '<p class="text-gray-500">Навыки не добавлены</p>';
      return;
    }
    
    this.skills.forEach(skill => {
      const skillBadge = this.createSkillBadge(skill);
      this.skillsContainer.appendChild(skillBadge);
    });
  }
  
  createSkillBadge(skill) {
    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-fade-in';
    badge.innerHTML = `
      ${skill}
      <button class="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none remove-skill" data-skill="${skill}">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;
    
    // Добавляем обработчик для удаления
    const removeBtn = badge.querySelector('.remove-skill');
    removeBtn.addEventListener('click', () => this.removeSkill(skill));
    
    return badge;
  }
  
  setupEventListeners() {
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.addSkill());
    }
    
    if (this.skillInput) {
      this.skillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addSkill();
        }
      });
    }
  }
  
  async addSkill() {
    const skill = this.skillInput.value.trim();
    
    if (!skill) {
      this.showNotification('Введите навык', 'error');
      return;
    }
    
    if (this.skills.includes(skill)) {
      this.showNotification('Этот навык уже добавлен', 'warning');
      return;
    }
    
    // Добавляем навык временно для немедленного отображения
    this.skills.push(skill);
    this.renderSkills();
    
    // Очищаем input
    this.skillInput.value = '';
    
    try {
      // Отправляем на сервер
      await this.saveSkills();
      this.showNotification('Навык успешно добавлен!', 'success');
    } catch (error) {
      // В случае ошибки откатываем изменения
      this.skills = this.skills.filter(s => s !== skill);
      this.renderSkills();
      this.showNotification('Ошибка при сохранении', 'error');
    }
  }
  
  async removeSkill(skillToRemove) {
    // Визуальное подтверждение
    if (!confirm(`Удалить навык "${skillToRemove}"?`)) return;
    
    // Удаляем из массива
    this.skills = this.skills.filter(skill => skill !== skillToRemove);
    
    // Анимированно удаляем из DOM
    const badges = this.skillsContainer.children;
    for (let badge of badges) {
      if (badge.textContent.includes(skillToRemove)) {
        badge.classList.add('animate-fade-out');
        setTimeout(() => {
          this.renderSkills();
        }, 300);
        break;
      }
    }
    
    try {
      await this.saveSkills();
      this.showNotification('Навык удален', 'success');
    } catch (error) {
      // Восстанавливаем навык в случае ошибки
      this.skills.push(skillToRemove);
      this.renderSkills();
      this.showNotification('Ошибка при удалении', 'error');
    }
  }
  
  async saveSkills() {
    const response = await fetch('/api/user/skills', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills: this.skills })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка сохранения');
    }
    
    return response.json();
  }
  
  showNotification(message, type) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-yellow-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new SkillsManager();
});