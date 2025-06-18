/**
 * @fileoverview This is the main entry point for the React app. It's a simple component that
 * renders the Infinitoe component. It's not very exciting, but it's the glue that holds the
 * whole thing together.
 */

import Infinitoe from './components/Infinitoe';

/**
 * The main App component. It's a simple functional component that renders the Infinitoe component.
 *
 * @returns {JSX.Element} The rendered component.
 */
function App() {
    return <Infinitoe />;
}

export default App;
