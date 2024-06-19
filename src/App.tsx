import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './index.css'
import { Button } from './components/ui/button.tsx'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const [value, setValue] = useState<string>('')
  // const [error, setError] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([])

  const randomQuestion: string[] = [
    'Give me an array or list coding challenge.',
    'Give me a string coding challenge.',
    'Give me a binary search coding challenge.'
  ]

  const random = () => {
    const randomValue = randomQuestion[Math.floor(Math.random() * randomQuestion.length)]
    setValue(randomValue)
  }

  const getResponse = async () => {
    if (!value) {
      toast.error('Error! Please ask a question.')
      return
    }
    try {
      const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const response = await fetch('https://gemini-coding-buddy.onrender.com/gemini', options)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
      const data = await response.text()

      setChatHistory((oldChatHistory) => [...oldChatHistory, {
        role: 'user',
        parts: [{ text: value }]
      },
      {
        role: 'model',
        parts: [{ text: data }]
      }
      ])
      setValue('')

    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(`An error has occurred: ${error.message}`)
      } else {
        toast.error('An unknown error has occurred.')
      }
    }
  }

  // const clear = () => {
  //   setValue('')
  //   setError('')
  //   setChatHistory([])
  // }

  return (
    <div id='app' className='flex flex-col w-[100vw] h-[100vh] bg-slate-900'>
      <div className='flex flex-col mx-auto w-[80vw] h-[70vh] md:h-[85vh] my-2'>
        <div className='flex flex-col md:flex-row md:justify-evenly'>
          <p className='flex justify-center align-middle text-center items-center py-2 font-light mx-auto'>Welcome to your coding assistant. What would you like to know?
          </p>
          <Button className='mx-auto justify-center hover:bg-indigo-800 hover:text-white hover:shadow-md hover:shadow-cyan-500'
            onClick={random}
            disabled={!chatHistory}
          >
            Get Random Challenge
          </Button>
        </div>

        <div id='chat-box' className='h-full flex flex-col justify-center items-center mx-auto'>
          <div className='flex flex-col overflow-y-scroll my-4 mx-auto w-[80vw] h-full md:h-[90vh] bg-indigo-950 rounded-md border-solid border-cyan-300 border-2 p-2'>
            {chatHistory.map((chatItem, _index) => (
              <div key={_index} className={`flex ${chatItem.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                {chatItem.role !== 'user' && (
                  <img
                    src='/logo-color.svg'
                    alt='model avatar'
                    className='w-10 h-10 rounded-full mr-2'
                  />
                )}
                <p className={`max-w-sx p-3 rounded-lg ${chatItem.role === 'user' ? ' text-right bg-blue-900 shadow-md shadow-cyan-500 w-10/12' : 'bg-green-900 text-left shadow-md shadow-green-400 whitespace-pre-wrap w-10/12'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className={`${chatItem.role === 'user' ? 'text-right' : 'text-left prose prose-invert'}`}>
                    {chatItem.parts[0].text}
                  </ReactMarkdown>
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>
      <div id='chat-input' className='flex justify-center text-slate-400 w-full h-16  absolute inset-x-0 bottom-0 mx-auto mt-6'>
        <textarea
          value={value}
          placeholder='Ask and you shall receive'
          onChange={(e) => setValue(e.target.value)}
          className='w-[80%] h-12 rounded-sm font-light pl-4 text-black'
          rows={3}
        />
        <Button className=' h-12 ml-4 hover:bg-indigo-800 hover:text-white hover:shadow-md hover:shadow-cyan-500' onClick={getResponse}>Send</Button>
      </div>
      <ToastContainer />
    </div>
  )
}