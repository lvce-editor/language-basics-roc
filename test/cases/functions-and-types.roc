distance : Point, Point -> F64
distance = |first, second| {
    dx = first.x - second.x
    dy = first.y - second.y
    Num.sqrt(dx * dx + dy * dy)
}

Result(a, err) : [Ok(a), Err(err)]
main! = |_args| echo!("Hello, Roc!")
