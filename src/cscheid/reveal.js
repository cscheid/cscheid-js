export function setSlideDispatchers(slideDispatchers)
{
  Reveal.addEventListener('fragmentshown', function(event) {
    var dispatcher = slideDispatchers[event.fragment.parentElement.id];
    if (!dispatcher)
      return undefined;
    dispatcher = dispatcher['fragmentshown'];
    if (!dispatcher)
      return undefined;
    return dispatcher(event);
  });

  Reveal.addEventListener('fragmenthidden', function(event) {
    var dispatcher = slideDispatchers[event.fragment.parentElement.id];
    if (!dispatcher)
      return undefined;
    dispatcher = dispatcher['fragmenthidden'];
    if (!dispatcher)
      return undefined;
    return dispatcher(event);
  });
}
