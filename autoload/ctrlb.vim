
function! ctrlb#execute(arg_string) abort
    return _ctrlb_execute(a:arg_string)
endfunction

function! ctrlb#open(buffer_type) abort
    return _ctrlb_open(a:buffer_type)
endfunction

function! ctrlb#open_layout(json_file_path) abort
    let absolute_file_path = fnamemodify(a:json_file_path, ':p')
    return _ctrlb_open_layout(absolute_file_path)
endfunction

function! ctrlb#do_action(buffer_type, action_name) range abort
    return _ctrlb_do_action(a:buffer_type, a:action_name, a:firstline, a:lastline)
endfunction

function! ctrlb#clear_all() abort
    return _ctrlb_clear_all()
endfunction

function! ctrlb#_complete(current_arg, line, cursor_position) abort
    let candidates = _ctrlb_complete(a:current_arg, a:line, a:cursor_position)
    return join(candidates, "\n")
endfunction

function! ctrlb#ping() abort
    let client = ctrlb#config#get('executable_client')
    let port = ctrlb#config#get('port')

    let pong = trim(system(client . ' --port ' . port  . ' ping'))
    return pong ==? 'pong'
endfunction

let s:server_job_id = ''
function! ctrlb#start_server() abort
    if ctrlb#ping()
        return
    endif

    let server = ctrlb#config#get('executable_server')
    let port = ctrlb#config#get('port')
    let port_option = empty(port) ? '' : '--port=' . port

    let server_port = ctrlb#config#get('server_port')
    let server_port_option = empty(server_port) ? '' : '--outside=' . server_port

    let server_allow = ctrlb#config#get('server_allow')
    if empty(server_allow) && !empty(server_port)
        let server_allow_option = '--outside-allow=127.0.0.1:' . server_port
    elseif !empty(server_allow)
        let server_allow_option = '--outside-allow=' . server_allow
    else
        let server_allow_option = ''
    endif

    let cmd = join([server, port_option, 'server', server_port_option, server_allow_option], ' ')
    let s:server_job_id = jobstart(cmd)
endfunction

function! ctrlb#stop_server() abort
    if !s:server_job_id
        return
    endif

    try
        call jobstop(s:server_job_id)
    catch /E900: Invalid channel id/
    endtry
endfunction
