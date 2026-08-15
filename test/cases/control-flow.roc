classify = |number| {
    if number < 0 {
        Negative
    } else if number == 0 {
        Zero
    } else {
        Positive
    }
}

color_name = |color| match color {
    Red => "red"
    Green | Blue => "cool"
}

expect classify(1) == Positive
