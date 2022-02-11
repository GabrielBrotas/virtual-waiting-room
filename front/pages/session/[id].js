import React, { useEffect, useState } from 'react'
import { useCookies } from "react-cookie"
import { useRouter,  } from 'next/router'
import api from '../services/api'
import styles from '../../styles/Home.module.css'
import io from 'socket.io-client'

function useSocket(url) {
  const [socket, setSocket] = useState(null)
  const [cookie, setCookie] = useCookies(["user"])
  const router = useRouter()
  const { id: session_id } = router.query

  useEffect(() => {
    if(!cookie.user) return
    if(!session_id) return
    
    const socketIo = io(url)

    setSocket(socketIo)

    socketIo.emit('add-to-main-room', { user_id: cookie.user.user._id, session_id })

    // return () => {
    //     socketIo.disconnect()
    // }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookie.user, session_id])

  return socket
}

export default function Session() {
    const router = useRouter()
    const { id: session_id } = router.query

    const [cookie, setCookie] = useCookies(["user"])
    
    const socket = useSocket(`http://localhost:4000`)
    
    
    const [session, setSession] = useState()
    

    const [virtualRoom, setVirtualRoom] = useState({
        main: false,
        waitingRoom: false,
        queuePosition: 0,
        error: null,
        loading: true,
        ticket: null
    })
    
    async function handleBuyTicket() {
        if(!socket) return
        if(!cookie.user) return
        if(!session_id) return

        socket.emit('buy-ticket', {
            buyer_id: cookie.user.user._id,
            session_id
        })
    }

    useEffect(() => {
        if(session_id) {
            api.get(`/rooms/movie/${session_id}`).then(({data}) => {
                if(data.session) {
                    setSession(data.session)
                }
            })
        }
    }, [session_id])

    useEffect(() => {
        if(!cookie.user) {
        router.push('/')
        }
    }, [cookie, router])


    // useEffect(() => {
    //     if(!socket) return
    //     if(!cookie.user) return
    //     if(!session_id) return
    //     const { _id: user_id } = cookie.user.user

    //     // socket.emit('add-to-main-room', { user_id, session_id })

    // }, [cookie.user, session_id, socket])
    console.log(virtualRoom)
    useEffect(() => {
        if(!socket) return
        if(!cookie.user) return
        if(!session_id) return

        const { _id: user_id } = cookie.user.user


        socket.on('add-to-main-room', ({success, ticket, data, error}) => {
            if(success) {
                if(ticket) {
                    setVirtualRoom({
                        main: true,
                        waitingRoom: false,
                        queuePosition: 0,
                        loading: false,
                        ticket
                    })
                    return
                }

                if (data.isWaitingRoom) {
                    setVirtualRoom({
                        main: false,
                        waitingRoom: true,
                        queuePosition: data.queuePosition,
                        loading: false,
                        ticket: data.ticket
                    })
                    return
                }

            } else {
                console.log({data, error, ticket})
                setVirtualRoom({
                    main: false,
                    waitingRoom: false,
                    queuePosition: 0,
                    error: error,
                    loading: false
                })
            }
        })

        socket.on('buy-ticket', ({success, data}) => {
            if(success) {
                console.log({data})
                
                alert('Bought successfully')
                router.push('/rooms')
            }
        })

        // socket.on('move-waiting-room', ({data}) => {
        //     if(data.session_id && data.session_id == session_id) {
        //         socket.emit('add-to-main-room', { user_id, session_id })
        //     }
        // })

        socket.on(`update-room:${session_id}`, ({whoLeft, success, nextTicket}) => {
            
            console.log({whoLeft, success, nextTicket, myTicket: virtualRoom.ticket});

            if(success && whoLeft && virtualRoom.ticket !== whoLeft) {
                if(nextTicket == virtualRoom.ticket) {
                    setVirtualRoom({
                        main: true,
                        waitingRoom: false,
                        queuePosition: 0,
                        loading: false,
                        ticket: nextTicket
                    })
                } else {
                    setVirtualRoom({
                        main: false,
                        waitingRoom: true,
                        queuePosition: virtualRoom.queuePosition - 1,
                        loading: false,
                        ticket: virtualRoom.ticket
                    })
                }
            }
            // socket.emit('add-to-main-room', { user_id, session_id })
        })

        socket.on('disconnect', () => {
            console.log('disconnected')
        })

        router.beforePopState(() => {
            if(virtualRoom.main) {
                console.log(`remove main => ${user_id} => ${session_id}`)
                socket.emit('remove-from-main-room', { user_id, session_id })
                socket.disconnect()
                return true
            } 

            if(virtualRoom.waitingRoom) {
                console.log('remove from waiting')

                socket.emit('remove-from-waiting-room', { user_id, session_id })
                socket.disconnect()
                return true
            }
      
            return true
        })
        
        // return () => {
        //     if(virtualRoom.main) {
        //         console.log(`remove main => ${user_id} => ${session_id}`)
        //         socket.emit('remove-from-main-room', { user_id, session_id })
        //         socket.disconnect()
        //         return
        //     } 

        //     if(virtualRoom.waitingRoom) {
        //         console.log('remove from waiting')

        //         socket.emit('remove-from-waiting-room', { user_id, session_id })
        //         socket.disconnect()
        //         return
        //     }
        // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // cookie?.user?.user, 
        // session_id, 
        socket, 
        virtualRoom, 
    ])

    if(!session) return <></>

    return (
    <div className={styles.container}>
        <h1>Session</h1>

        <div>
            <p><strong>Movie:</strong> {session.movie.name}</p>
            <p><strong>Room Number:</strong> {session.room.number}</p>
            <p><strong>Seats:</strong> {session.room.seats}</p>
            <p><strong>Date:</strong> {session.start_time}</p>

            <p><strong>Seats Remaining:</strong> {session.room.seats - session.tickets.length}</p>

            
        </div>

        {virtualRoom.loading ? (
            <p>Loading...</p>
        ) : virtualRoom.main ? (
            <button onClick={handleBuyTicket}>Buy</button>
        ) : virtualRoom.waitingRoom ? (
            <p>You are in the waiting room. Your position is {virtualRoom.queuePosition}</p>
        ) : virtualRoom.error ? (
            <span>{virtualRoom.error}</span>
        ) : (
            <button onClick={() => {
                socket.emit('add-to-main-room', { user_id: cookie.user.user._id, session_id })
            }}>Refresh</button>
        )}
            

    </div>
  )
}
