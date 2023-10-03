import { createRoot } from 'react-dom/client'
import App from './Components/App/App'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './redux'
import { BrowserRouter } from 'react-router-dom'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreState: true,
        ignoreActions: true,
      },
    }),
})

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
