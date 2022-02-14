import React, { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import api from './services/api'
import { useCookies } from "react-cookie"
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  const [cookie, setCookie] = useCookies(["user"])

  const [state, setState] = useState({
    email: '',
    password: '',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if(!state.email || !state.password) return

    try {
      const { data } = await api.post('/users/login', state)

      if(data.data) {
        setCookie("user", JSON.stringify(data.data), {
          path: "/",
          maxAge: 3600 * 24 * 10, // Expires after 10 days
          sameSite: true,
        })
      }
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(cookie.user) {
      router.push('/rooms')
    }
  }, [cookie, router])

  return (
    <div className={styles.container}>
      <form 
        onSubmit={handleSubmit}
        style={{display: 'flex', flexDirection: 'column'}}
      >
        <h1>Login</h1>
        <div style={{marginBottom: 10}}>
          <label>
            <input 
              type="text" 
              placeholder="email"
              value={state.email}
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  email: e.target.value
                }))
              }}
            />
          </label>
        </div>

        <label>
          <input 
            type="password"
            placeholder="Password"
            value={state.password}
            onChange={(e) => {
              setState((prev) => ({
                ...prev,
                password: e.target.value
              }))
            }}
          />
        </label>
        
        <button style={{width: 200, marginTop: 10}} type="submit">Login</button>
      </form>
    </div>
  )
}
