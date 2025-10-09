// ( function () {
// 	const { wp } = window;
// 	const { createRoot } = wp.element;
// 	const { TextControl, Button } = wp.components;
//
// 	function App() {
// 		return (
// 			<div>
// 				<TextControl label="Minimum words" />
// 				<Button variant="primary">Save</Button>
// 			</div>
// 		);
// 	}
// 	const root = document.getElementById('tasks-settings-root');
// 	if (root) createRoot(root).render(<App />);
// } )();

import { createRoot } from '@wordpress/element';
import { TextControl, Button } from '@wordpress/components';

console.log( 'Tasks Settings loaded' );

function App() {
	return (
		<div>
			<TextControl label="Minimum words" />
			<Button variant="primary">Save</Button>
		</div>
	);
}

const root = document.getElementById( 'tasks-settings-root' );
if ( root ) createRoot( root ).render( <App /> );
