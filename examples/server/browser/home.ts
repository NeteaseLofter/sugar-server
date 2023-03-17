console.log('welcome home');

document.querySelector('#btn')?.addEventListener('click', () => {
  alert('welcome home')
}, false)

// 这个只是为了不ts报错
export default '';