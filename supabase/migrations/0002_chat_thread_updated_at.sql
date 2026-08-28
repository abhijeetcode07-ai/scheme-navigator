-- Keep the newest SetuSathi conversation first in the user's private history.
create or replace function public.touch_chat_thread()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.chat_threads
  set updated_at = now()
  where id = new.thread_id
    and user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists chat_message_touches_thread on public.chat_messages;
create trigger chat_message_touches_thread
after insert on public.chat_messages
for each row execute procedure public.touch_chat_thread();

revoke all on function public.touch_chat_thread() from public;
