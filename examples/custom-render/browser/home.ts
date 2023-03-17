const randomNames = [
  '张三',
  '李四',
  '王五'
]

document.querySelector('#btn')?.addEventListener('click', () => {
  const nameDom = document.querySelector('#name');
  if (nameDom) {
    nameDom.innerHTML = randomNames[
      Math.floor(randomNames.length * Math.random())
    ]
  }
})


export default '';