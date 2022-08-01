package com.data.mymoney

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class MainActivity : AppCompatActivity() {

    var myFbTextView: TextView? = null

    var database = FirebaseDatabase.getInstance()
    var myRef = database.getReference("ingreso-gasto")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        myFbTextView = findViewById<TextView>(R.id.textView)
    }

    override fun onStart() {
        super.onStart()
        myRef.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(dataSnapshot: DataSnapshot) {
                val value = dataSnapshot.value.toString()
                myFbTextView?.text = value
            }

            override fun onCancelled(error: DatabaseError) {
            }
        })
    }

}