
function! ctrlb#execute(arg_string) abort
    return _ctrlb_execute(a:arg_string)
endfunction

function! ctrlb#open(arg_string) abort
    return _ctrlb_open(a:arg_string)
endfunction

function! ctrlb#do_action(buffer_type, action_name) abort
    return _ctrlb_do_action(a:buffer_type, a:action_name)
endfunction

function! ctrlb#clear_all() abort
    return _ctrlb_clear_all()
endfunction

let s:custom = {
    \ 'executable_path': 'wsxhub',
\ }

function! ctrlb#custom(name, value) abort
    let s:custom[a:name] = a:value
endfunction

function! ctrlb#get_custom() abort
    return s:custom
endfunction
