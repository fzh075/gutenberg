<?php
/**
 * Bootstrapping the Gutenberg tasks page.
 *
 * @package gutenberg
 */

/**
 * The main entry point for the Gutenberg tasks page.
 *
 * @since TODO fzh075
 */
function render_tasks_settings_page() {
    if ( ! current_user_can( 'edit_posts' ) ) return;

    $data = get_option('wp_tasks_data', []);

    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Tasks', 'wp-tasks' ); ?></h1>

        <form method="post" action="">
            <table class="form-table" role="presentation">
                <tbody>
                <tr>
                    <th scope="row">
                        <label for="wp-task-enabled"><?php esc_html_e( 'Enable', 'wp-tasks' ); ?></label>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" id="wp-task-enabled" />
                        </label>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="wp-task-title-length"><?php esc_html_e( 'Minimum Title Length', 'wp-tasks' ); ?></label>
                    </th>
                    <td>
                        <label>
                        	Min
							<input type="number" min="0" step="1"
								   id="wp-task-min" />
                        </label>
                    </td>
                    <td>
                        <label>
                        	Max
							<input type="number" min="0" step="1"
								   id="wp-task-max" />
                        </label>
                    </td>
                </tr>
                </tbody>
            </table>

			<p>
				<button class="button button-primary" id="wp-tasks-save">Save Changes</button>
			</p>
        </form>

        <div id="wp-tasks-msg" style="margin-top:10px;"></div>
        <pre id="wp-tasks-preview" style="background:#f6f7f7;border:1px solid #ccd0d4;padding:10px;max-width:800px;overflow:auto;"></pre>
    </div>
    <?php

//		wp_register_script(
//			'my-tasks-admin',
//			false,
//			[ 'wp-data', 'wp-core-data', 'wp-api-fetch' ],
//			null,
//			true
//		);
//	wp_enqueue_script('my-tasks-admin');
	wp_enqueue_script('wp-api-fetch');
    wp_add_inline_script(
			'wp-api-fetch',
			<<<JS
			(function(){
				const \$ = (id)=>document.getElementById(id);
				const msg = (s,type='info')=>{
					\$('wp-tasks-msg').innerHTML = '<div class="'+type+'">'+s+'</div>';
				};

				const groups = ['post']

				async function load(){
					try{
						// const tasks = wp.data.select('core').getEntityRecords('root', 'tasks', { groups });
						const tasks = await wp.apiFetch({
							path: '/wp/v2/tasks?' + new URLSearchParams(groups.map(group => ['groups[]', group])).toString()
						});

						const task = tasks['task-title-length']
						if (!task) {
							return;
						}

						if(task.enabled){
							const config = task.config;
							\$('wp-task-enabled').checked = true;
							\$('wp-task-min').value = config.min;
							\$('wp-task-max').value = config.max;
						}
					}catch(e){
						console.error(e);
						msg('读取失败：' + (e?.message || e), 'error');
					}
				}
				load().then();

				async function save(){

						const tasks = await wp.apiFetch({
							path: '/wp/v2/tasks?' + new URLSearchParams(groups.map(group => ['groups[]', group])).toString()
						});

					const enabled = \$('wp-task-enabled').checked;
					if (enabled) {
						let min = \$('wp-task-min').value
						if (min) {
							min = Number(min)
						} else {
							min = null
						}
						let max = \$('wp-task-max').value
						if (max) {
							max = Number(max)
						} else {
							max = null
						}

						const task = {
							type: 'preset',
							config: {min, max},
							enabled: enabled,
							completed: false,
							name: 'Number of characters in title'
						}
						if (min && max) {
							task.messageTemplate = `Title should be no less than \${min} characters and no more than \${max}.`
						} else if (min) {
							task.messageTemplate = `Title should be no less than \${min} characters.`
						} else if (max) {
							task.messageTemplate = `Title should be no more than \${max} characters.`
						}
						tasks['task-title-length'] = task;
					} else {
						delete tasks['task-title-length'];
					}
					try{
						await Promise.all(
							groups.map((group) =>
								wp.apiFetch({
									path: '/wp/v2/tasks',
									method: 'PUT',
									data: { group, tasks },
								})
							)
						);
						msg('保存成功 ✅');
					}catch(e){
						console.error(e);
						msg('保存失败：' + (e?.message || e), 'error');
					}
				}

				\$('wp-tasks-save').addEventListener('click', save);
			})();
			JS,
			'after'
	);
}

//add_action( 'admin_enqueue_scripts', function() {
//    wp_add_inline_script(
//        'wp-core-data',
//        'wp.data.dispatch("core").addEntities([{
//            name: "tasks",
//            kind: "root",
//            baseURL: "/wp/v2/tasks",
//        		key: "group"
//        }]);',
//        'after'
//    );
//
//    wp_add_inline_script(
//        'wp-core-data',
//        'wp.data.dispatch("core").addEntities([{
//            name: "task-settings",
//            kind: "root",
//            baseURL: "/wp/v2/task/settings",
//            key: undefined
//        }]);',
//        'after'
//    );
//});

//	error_log(print_r('xxxxxxxxx', true));
//	error_log(print_r($results, true));
add_action( 'rest_api_init', function () {
    register_rest_route( 'wp/v2', '/tasks', [
        [
						'permission_callback' => function() { return current_user_can('edit_posts'); },
						'methods'  => WP_REST_Server::READABLE,
						'args'     => [ 'groups' => [ 'type' => 'array', 'items' => [ 'type' => 'string' ], 'required' => true ] ],
						'callback' => function( $req ) {
							$groups = (array) $req->get_param( 'groups' );
							if ( empty($groups) ) return [];

								$data = get_option('wp_tasks_data', []);
								$tasks = [];
							foreach ($groups as $group) {
								$tasks += $data[$group] ?? [];
							}
							if (empty($tasks)) {
								$tasks = (object) [];
							}
							return $tasks;
//							$results = [];
//								foreach ($data as $group => $tasks) {
//										$results[] = [
//												'group' => $group,
//												'tasks' => $tasks,
//										];
//								}
//								return $results;
						},
        ],
        [
						'permission_callback' => function() { return current_user_can('edit_posts'); },
						'methods'  => WP_REST_Server::EDITABLE,
						'args'     => [ 'group' => [ 'type' => 'string' , 'required' => true ], 'tasks' => [ 'type' => 'object', 'required' => true ] ],
						'callback' => function( $req ) {
								$group = $req->get_param( 'group' );
								$tasks = (array) $req->get_param( 'tasks' );
							error_log(print_r('xxxxxxxxx', true));
							error_log(print_r($group, true));
							error_log(print_r($tasks, true));

								$data = get_option('wp_tasks_data', []);
							error_log(print_r($data, true));
								$data[$group] = $tasks;
							error_log(print_r($data, true));
								update_option('wp_tasks_data', $data);
								return ['success' => true];
						},
        ],
    ] );

//     register_rest_route( 'wp/v2', '/tasks/settings', [
//         [
//             'permission_callback' => function() { return current_user_can('edit_posts'); },
//             'methods'  => WP_REST_Server::READABLE,
//             'callback' => function() {
//                 return get_option('wp_tasks_settings', [ 'enabled' => true, 'rules' => [] ]);
//             },
//         ],
//         [
//             'permission_callback' => function() { return current_user_can('manage_options'); },
//             'methods'  => WP_REST_Server::EDITABLE,
//             'callback' => function($req) {
//                 $data = $req->get_json_params();
//                 update_option('wp_tasks_settings', is_array($data) ? $data : []);
//                 return rest_ensure_response($data);
//             },
//             'args' => [
//                 // 可选：提供 schema 校验
//             ],
//         ],
//     ] );
});

// add_filter( 'block_editor_rest_api_preload_paths', function( $paths ) {
//     $paths[] = '/wp/v2/settings';
//     return $paths;
// } );

/**
 * Set up the tasks settings.
 *
 * @since TODO fzh075
 */

// function gutenberg_initialize_tasks_settings() {
// 	wp_enqueue_script(
// 	  'tasks-settings-js',
// 	  plugins_url('tasks-settings/index.js', __FILE__),
// 	  ['wp-element','wp-components','wp-data','wp-core-data','wp-api-fetch'],
// 	  '1.0.0',
// 	  true
// 	);
// }
// add_action( 'admin_init', 'gutenberg_initialize_tasks_settings'));

// add_action( 'admin_enqueue_scripts', function($hook) {
// 	if ($hook === 'toplevel_page_tasks-settings') {
// 		wp_enqueue_script(
// 		  'tasks-settings-js',
// 		  plugins_url('tasks-settings/build/index.js', __FILE__),
// 		  ['wp-element','wp-components','wp-data','wp-core-data','wp-api-fetch'],
// 		  '1.0.0',
// 		  true
// 		);
//
// 		wp_enqueue_style( 'wp-components');
// 	}
// } );

// add_action( 'admin_enqueue_scripts', function($hook) {
// 	if ($hook === 'toplevel_page_tasks-settings') {
// 		$gutenberg_dir = dirname( __FILE__ ) . '/..';
// 		$asset_file = $gutenberg_dir . '/build/editor/index.asset.php';
// 		if ( file_exists($asset_file) ) {
// 			$asset = require $asset_file;
// 			wp_enqueue_script(
// 			  'tasks-settings-js',
// 			  plugins_url('build/editor/index.js', $gutenberg_dir . '/gutenberg.php' ),
// 			  $asset['dependencies'],
// 			  $asset['version'],
// 			  true
// 			);
// 		}
// 	}
// } );

// add_action( 'admin_enqueue_scripts', function($hook) {
// 	if ($hook === 'toplevel_page_tasks-settings') {
// 		$gutenberg_dir = dirname( __FILE__ ) . '/..';
// 		wp_enqueue_script(
// 		  'tasks-settings-js',
// 		  plugins_url('packages/editor/src/components/task/tasks-settings.js', $gutenberg_dir . '/gutenberg.php' ),
// 		  ['wp-element','wp-components','wp-data','wp-core-data','wp-api-fetch'],
// 		  '1.0.0',
// 		  true
// 		);
// 	}
// } );
