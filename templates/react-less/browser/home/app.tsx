import React, {
  useCallback,
  useState
} from 'react';

import cls from './app.less';

const randomNames = [
  '张三',
  '李四',
  '王五'
]

export const App = () => {
  const [name, setName] = useState(() => {
    return randomNames[Math.floor(randomNames.length * Math.random())]
  })

  const changeName = useCallback(() => {
    setName(
      randomNames[Math.floor(randomNames.length * Math.random())]
    )
  }, [])

  return (
    <div>
      <h1
        className={cls.title}
      >welcome</h1>
      <h4
        className={cls.name}
      >{name}</h4>
      <button
        onClick={changeName}
      >点击换个名字</button>
    </div>
  )
}