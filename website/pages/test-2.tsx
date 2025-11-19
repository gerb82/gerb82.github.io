import { NavLink } from 'react-router'

export default function PageRender() {
  return (
    <div>
      renderA
      <NavLink to={'/test'}>HELLO WORLD </NavLink>
    </div>
  )
}