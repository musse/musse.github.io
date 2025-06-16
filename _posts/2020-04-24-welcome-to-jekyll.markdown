---
layout: post
title: All about Go's Stringer interface
---

One of Go's simplest and most used interfaces is `Stringer`:

```go
type Stringer interface {
    String() string
}
```

[Defined][fmt-stringer] by the `fmt` package, a type that implements it can be textually
described with its `String()` method. The `fmt` package printing functions check
if your types implement it to know how to print your values. Implementing
`Stringer` is useful for many purposes, such as for logging and debugging.

Well, there's not much to it, right? So I thought.

## Pointer and value receivers

A couple days ago, I had implemented `Stringer` for a type of mine:

```go
package dog

import "fmt"

type Dog struct {
    name string
    breed string
}

func (d *Dog) String() string {
    return fmt.Sprintf("My name is %s, I'm a %s! Woof!", d.name, d.breed)
}
```

When I tried printing a `Dog`:

```go
package main

import "fmt"

func main() {
    d := dog.Dog{"Rex", "poodle"}
    fmt.Print(d)
}
```

For some reason, Go refused to work and output `{Rex poodle}` instead of my
~~cute~~ custom message.

After some googling, I found the explanation in the [Effective Go
page][pointer-vs-value] (actually, a link to it in Stack Overflow, but you know
what I mean):

> The rule about pointers vs. values for receivers is that value methods can be
> invoked on pointers and values, but pointer methods can only be invoked on
> pointers. This is because pointer methods can modify the receiver; invoking
> them on a copy of the value would cause those modifications to be discarded.

Since my `String()` method was implemented on a `*Dog` pointer receiver, it
could not be called for my `Dog` value.

There are at least two possible solutions for this problem:

1. Change your `String()` method to a value receiver so that it may be invoked
   for both values and pointers;
2. Keep the pointer receiver and always pass a pointer when you want your
   `String()` method to be invoked.

Solution #2 is specially recommended if copying your value is too costly.

After changing my method to a value receiver, I finally got the message I
wanted:

```
My name is Rex, I'm a poodle! Woof!
```

## Stringer for enumerations

An idiomatic manner to building enums in Go is to define an alias type for `int`
and then define constants correspoding to the possible enum values with
[iota][iota]:

```go
package dog

type Breed int

const (
    Poodle Breed = iota
    Beagle
    Labrador
    Pug
)
```

Let's change our `Dog` struct to use this enum:

```go
type Dog struct {
    name string
    breed Breed
}

// we now have a value receiver
func (d Dog) String() string {
    return fmt.Sprintf("My name is %s, I'm a %s! Woof!", d.name, d.breed)
}
```

If we try to print our example `Dog` again:

```go
func main() {
    d := dog.Dog{"Rex", dog.Poodle}
    fmt.Print(d)
}
```

We get a weird message:

```
My name is Rex, I'm a %!s(main.Breed=0)! Woof!
```

This happens because the `Breed` type is not a `string` nor does it implement
the `Stringer` interface.

To solve this problem, we could implement the `String()` method for `Breed`:

```go
func (b Breed) String() string {
    switch b {
        case Poodle: return "poodle"
        case Beagle: return "beagle"
        // and so on...
    }
}
```

This is very error-prone. We would need to change this method each time we add,
remove or change an enum value.

To overcome this issue, we can use Go's `stringer` tool:

> Stringer is a tool to automate the creation of methods that satisfy the
> fmt.Stringer interface.

You can download and install it with:

```
go get https://godoc.org/golang.org/x/tools/cmd/stringer`
```

Running `stringer -type Breed` from our `dog` package folder will generate a
`breed_string.go` file containing a `String` method for the `Breed` type which
is exactly as we would expect.

We can even add a [Go generate directive][go-generate] to our file so that this
file is programatically created with `go generate`:

```go
//go:generate stringer -type=Breed
```

No more manual writing of `String()` methods for enums.

You'll find all there is to know about `stringer` on its [GoDoc
page][stringer-tool].

[pointer-vs-value]: https://golang.org/doc/effective_go.html#pointers_vs_values
[fmt-stringer]: https://golang.org/pkg/fmt/#Stringer
[iota]: https://golang.org/ref/spec#Iota
[go-generate]: https://golang.org/cmd/go/#hdr-Generate_Go_files_by_processing_source
[stringer-tool]: https://godoc.org/golang.org/x/tools/cmd/stringer
