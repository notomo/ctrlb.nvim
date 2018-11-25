
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
