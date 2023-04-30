const img_size = 48;
const turret_time_max = 25
const turret_time_min = 5
const turret_rotate_speed = 0.05
const body_rotate_speed = 0.05
const timer = ms => new Promise(res => setTimeout(res, ms))
let field_width = 0
let field_height = 0

$(document).ready(function()
{
    field_width = $(".tank-play-field").width() - img_size
    field_height = $(".tank-play-field").height() - img_size
    const tanks = $(".tank-graphic")
    const tank_objs = []
    
    // Set initial random positions
    tanks.each(function()
    {
        $(this).css(
        {
            top: Math.random() * field_height,
            left: Math.random() * field_width,
            display: "inherit"
        });

        let tank_obj = {
            tank: $(this),
            x_vel: 0,
            y_vel: 0,
            turret_rot: 0,
            turret_rot_vel: 0,
            turret_timer: Math.random() * turret_time_max,
            body_rot: 0,
            body_target_rot: 0,
        }
        setVelAndRotation(tank_obj)

        tank_objs.push(tank_obj);
    });    

    main_loop(tank_objs)
});

async function main_loop(tanks)
{
    tanks.forEach(function(tank_obj)
    {
        let position = { x: parseFloat(tank_obj.tank.css("left")), y: parseFloat(tank_obj.tank.css("top")) }
        let vel = { x: tank_obj.x_vel, y: tank_obj.y_vel }

        // Check if hit edge
        if (((vel.x < 0 && position.x < 0) || (vel.x > 0 && position.x > field_width)) ||
            ((vel.y < 0 && position.y < 0) || (vel.y > 0 && position.y > field_height)))
        {
            let vel = randVel()
            tank_obj.x_vel = vel.x
            tank_obj.y_vel = vel.y
            tank_obj.body_target_rot = vel.theta
        }
        else if (Math.abs(asPM180(tank_obj.body_target_rot - tank_obj.body_rot)) > body_rotate_speed * 2)
        {
            // Rotate body
            let rot_dir = rotationDir(tank_obj.body_rot, tank_obj.body_target_rot)
            tank_obj.body_rot += rot_dir * body_rotate_speed
            tank_obj.tank.css({"transform": `rotate(${tank_obj.body_rot}rad)`})

            // console.log(tank_obj, Math.abs(asPM180(tank_obj.body_target_rot - tank_obj.body_rot)), body_rotate_speed * 2)
        }
        else
        {
            // Fix rotation
            tank_obj.tank.css({"transform": `rotate(${tank_obj.body_target_rot}rad)`})

            // Move in direction
            tank_obj.tank.css(
            {
                top: position.y + tank_obj.y_vel,
                left: position.x + tank_obj.x_vel,
            });
        }
        
        // Turret rotation timer check
        if (tank_obj.turret_timer <= 0)
        {
            let raw_rotation = (Math.random() - 0.5) * 2

            if (raw_rotation < -0.5 || raw_rotation > 0.5)
            {
                tank_obj.turret_rot_vel = 0
            }
            else
            {
                tank_obj.turret_rot_vel = Math.sign(raw_rotation)
            }

            tank_obj.turret_timer = Math.random() * (turret_time_max - turret_time_min) + turret_time_min
        }
        tank_obj.turret_timer -= 1

        // Rotate turret
        tank_obj.turret_rot += tank_obj.turret_rot_vel
        tank_obj.tank.children(".tank-turret").css({"transform": `rotate(${tank_obj.turret_rot * turret_rotate_speed}rad)`})
    });

    await timer(20)
    main_loop(tanks)
}

function randVel()
{
    let theta = asPM180(Math.random() * Math.PI * 2)
    return { x: Math.cos(theta), y: Math.sin(theta), theta: theta }
}

function setVelAndRotation(tank_obj)
{
    let vel = randVel()
    tank_obj.x_vel = vel.x
    tank_obj.y_vel = vel.y
    tank_obj.body_rot = vel.theta
    tank_obj.body_target_rot = vel.theta
    tank_obj.tank.css({"transform": `rotate(${vel.theta}rad)`})
}

function rotationDir(from, to)
{
    let delta = to - from
    delta = asPM180(delta)

    return Math.sign(delta)
}

function asPM180(theta)
{
    while (theta > Math.PI)
    {
        theta -= Math.PI * 2
    }

    while (theta < -Math.PI)
    {
        theta += Math.PI * 2
    }

    return theta
}