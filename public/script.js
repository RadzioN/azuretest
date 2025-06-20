document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('item-form');
    const nameInput = document.getElementById('name');
    const descInput = document.getElementById('description');
    const itemsList = document.getElementById('items-list');
  
    // Funkcja do pobrania i wyświetlenia elementów
    async function fetchItems() {
      try {
        const res = await fetch('/api/items');
        if (!res.ok) throw new Error('Błąd podczas pobierania');
        const items = await res.json();
        itemsList.innerHTML = '';
        items.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `${item.id}: ${item.name}` + (item.description ? ` - ${item.description}` : '');
          itemsList.appendChild(li);
        });
      } catch (error) {
        console.error(error);
        itemsList.innerHTML = '<li>Nie udało się pobrać elementów</li>';
      }
    }
  
    // Obsługa formularza
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const description = descInput.value.trim();
      if (!name) return;
      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) {
          console.error('Błąd przy dodawaniu');
        }
        nameInput.value = '';
        descInput.value = '';
        fetchItems();
      } catch (error) {
        console.error(error);
      }
    });
  
    // Przy starcie pobieramy listę
    fetchItems();
  });