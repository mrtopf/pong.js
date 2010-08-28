=================
The Pong Protocol
=================

Sequence of actions
===================

1. User A loads the page, waiting for user B. User A is the master.
    - User A initiates connection, state of JSA is ``waiting_for_player``
    - JSA is marked as master
2. User B joins, User A gets notified.
    - User B initiates connection, state of JSB is ``waiting_for_game_start``
    - JSB is marked as slace
    - on notification JSA goes into ``waiting_for_game_start``
    - only master can start game
    - JSA and JSB initialize their positions
3. User A starts the game
    - JSA sends ``start`` and goes into ``running`` state.
    - JSB goes into ``running`` state as well
4. Ball moves, paddles move
    - JSA sends status updates frequently with y location of own paddle, x/y location of ball
    - JSB sends status updates when paddle changes and receives notifications
5. User A or B misses the ball: Notification of other player, increment of goal count
    - JSA notices if ball goes out. Sends ``goal`` and player number to ``slave``
    - both go into state ``waiting_for_game_start``, the losing player can restart
6. If one user gets x points, the game is over, notification of both users
    - then ``goal_and_game_over`` is sent.
    

Packet structure
================

We will try with JSON for a start::

    {
        'c' : 'waiting_for_game_start',
    }

Further payload is added as necessary.

The initialization process
==========================

1. Every connecting party sends ``init`` without any further information
2. The server checks if it's the first or second part of a pair.
3. It sends a reply ``ACK`` with a further fields ``type`` which either is ``master`` or ``slave``.
4. Once two parties are connected it will send another packet with the ``initialized`` command, telling both parties that they can start a game. The master can then start it

Starting the game
=================

1. The user on master hits the Play button
2. The master sends the ``start`` command to the server which relays it to the slave.
3. Both immediately start the game where the master actually is controlling the ball.

No ACK is necessary here.

Playing the game
================

- The master is doing the game mechanics by controlling the ball.
- The master sends commands called ``s`` (for status) to the server, including
    a list of 
    - y position of own paddle
    - x/y position of ball

e.g.::

    { 
        'c' : 's',
        's' : [230, 412, 563]
    }






