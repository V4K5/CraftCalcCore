type ToastProps = {
  title: string;
  description: string;
}

export function toast({ title, description }: ToastProps) {
  // Создаем элемент для toast
  const toastElement = document.createElement('div');
  toastElement.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
  toastElement.innerHTML = `
    <h3 class="font-bold">${title}</h3>
    <p>${description}</p>
  `;

  // Добавляем элемент в DOM
  document.body.appendChild(toastElement);

  // Удаляем элемент через 3 секунды
  setTimeout(() => {
    document.body.removeChild(toastElement);
  }, 3000);
}

