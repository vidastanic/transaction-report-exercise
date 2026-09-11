import { createApp } from './app';

const port = process.env.PORT || 3001;
createApp().listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
